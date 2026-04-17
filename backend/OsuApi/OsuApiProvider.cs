using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using osuStats.Config;
using osuStats.OsuApi.Interfaces;
using osuStats.OsuApi.Models;

namespace osuStats.OsuApi;

public class OsuApiProvider : IOsuApiProvider
{
    private const string osu_base = "https://osu.ppy.sh/";
    private const string api_scores_link = "api/v2/scores?cursor_string={0}";
    private const string api_token_link = "oauth/token";
    private readonly OsuApiConfig _config;

    private readonly HttpClient _httpClient;
    private readonly ILogger<OsuApiProvider> _logger;

    private TokenResponse? _userlessToken;
    private DateTime? _userlessTokenExpiration;

    public OsuApiProvider(IOptions<OsuApiConfig> config, HttpClient httpClient, ILogger<OsuApiProvider> logger)
    {
        _config = config.Value;
        _httpClient = httpClient;
        _logger = logger;

        RefreshUserlessToken().Wait();
    }

    public async Task<ScoresResponse?> GetScores(long? cursor)
    {
        await RefreshUserlessToken();

        var cursorString =
            cursor == null ? "" : Convert.ToBase64String(Encoding.Default.GetBytes($"{{\"id\": {cursor}}}"));

        var requestMessage = new HttpRequestMessage
        {
            Method = HttpMethod.Get,
            RequestUri = new Uri(osu_base + string.Format(api_scores_link, cursorString)),
            Headers = { Authorization = new AuthenticationHeaderValue("Bearer", _userlessToken!.AccessToken) }
        };
        requestMessage.Headers.Add("x-api-version", "99999999");

        var response = await _httpClient.SendAsync(requestMessage);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<ScoresResponse>();
    }

    private async Task RefreshUserlessToken()
    {
        if (_userlessTokenExpiration > DateTime.UtcNow)
        {
            return;
        }

        var requestModel = new GetUserlessTokenRequest
        {
            ClientId = _config.ClientId,
            ClientSecret = _config.ClientSecret
        };

        var requestMessage = new HttpRequestMessage
        {
            Method = HttpMethod.Post,
            RequestUri = new Uri(osu_base + api_token_link),
            Content = new StringContent(JsonSerializer.Serialize(requestModel), null, "application/json"),
            Headers = { Accept = { new MediaTypeWithQualityHeaderValue("application/json") } }
        };

        var response = await _httpClient.SendAsync(requestMessage);

        if (!response.IsSuccessStatusCode)
        {
            _logger.Log(LogLevel.Error, "Couldn't update userless token! Status code: {Code}", response.StatusCode);

            return;
        }

        _userlessToken = await response.Content.ReadFromJsonAsync<TokenResponse>();
        if (_userlessToken == null)
        {
            _logger.Log(LogLevel.Error, "Couldn't parse userless token! {Json}",
                await response.Content.ReadAsStringAsync());

            return;
        }

        _userlessTokenExpiration = DateTime.UtcNow.AddSeconds(_userlessToken.ExpiresIn);
    }
}
