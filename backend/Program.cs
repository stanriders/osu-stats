using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using osuStats.BackgroundServices;
using osuStats.Config;
using osuStats.Database;
using osuStats.OsuApi;
using osuStats.OsuApi.Interfaces;
using Serilog;
using Serilog.Settings.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration, new ConfigurationReaderOptions { SectionName = "Logging" })
    .ReadFrom.Services(services));

// Add services to the container.

var dbConfig = builder.Configuration.GetSection("Database");
var osuConfig = builder.Configuration.GetSection("osuApi");
var basePath = builder.Configuration.GetValue<string>("PathBase");

builder.Services.Configure<OsuApiConfig>(osuConfig);

var connectionString = new NpgsqlConnectionStringBuilder
{
    Host = dbConfig["Host"],
    Port = int.Parse(dbConfig["Port"]!),
    Database = dbConfig["Database"],
    Username = dbConfig["Username"],
    Password = dbConfig["Password"]
};

builder.Services.AddDbContext<DatabaseContext>(options =>
    options.UseNpgsql(connectionString.ConnectionString));


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("token", context =>
        RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 30,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 20,
                ReplenishmentPeriod = TimeSpan.FromSeconds(1),
                TokensPerPeriod = 1,
                AutoReplenishment = true
            }));
});

builder.Services.AddHttpClient<OsuApiProvider>();
builder.Services.AddSingleton<IOsuApiProvider, OsuApiProvider>();

builder.Services.AddHostedService<ScoresService>();
builder.Services.AddHostedService<CleanupService>();
builder.Services.AddHostedService<DailyAggregateFoldService>();

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions { ForwardedHeaders = ForwardedHeaders.All });

app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseCors(x =>
    {
        x.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });

    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsStaging() || app.Environment.IsProduction())
{
    app.Use((context, next) =>
    {
        context.Request.Scheme = "https";

        return next(context);
    });
}

app.UsePathBase(basePath);
app.UseRateLimiter();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetService<DatabaseContext>();
    context?.Database.SetCommandTimeout((int)TimeSpan.FromMinutes(10).TotalSeconds);
    context?.Database.Migrate();
}

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
