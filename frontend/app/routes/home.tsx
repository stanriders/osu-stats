import useSWR from "swr";
import { Spinner } from "~/components/ui/spinner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { type ChartConfig } from "~/components/ui/chart";
import { ButtonGroup } from "~/components/ui/button-group";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { ApiBase } from "~/lib/api";
import { type Mod } from "~/lib/mods";
import ModsPopover from "~/components/mods-popover";

const chartConfig = {} satisfies ChartConfig;

const fetcher = (...args: any[]) =>
  fetch(...args).then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  });

function Hourly({
  query,
  showUnfiltered,
}: {
  query: string;
  showUnfiltered: boolean;
}) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { data, error, isLoading } = useSWR(
    `${ApiBase}/hourly?${date ? `hourlyDate=${date.toISOString()}&` : ""}${query}`,
    fetcher,
    { refreshInterval: 5000, revalidateIfStale: false },
  );

  const calendarRangeStart = new Date();
  calendarRangeStart.setMonth(calendarRangeStart.getMonth() - 3);
  const calendarRangeEnd = new Date();

  const countByHour = data?.unfiltered?.countByHour.map((item) => ({
    hour: item.hour,
    unfiltered: item.count,
    filtered: data.filtered
      ? (data.filtered.countByHour.find((x) => x.hour === item.hour)?.count ??
        0)
      : null,
  }));

  const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: "numeric" });

  const stats = data?.filtered ?? data?.unfiltered;
  const int = new Intl.NumberFormat(undefined);
  const dec = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-wrap">
      <Card className="min-w-fit grow-1">
        {error ? (
          <CardContent>failed to load</CardContent>
        ) : (
          <>
            {isLoading ? (
              <CardContent>
                <Spinner />
              </CardContent>
            ) : (
              <>
                <CardHeader className="flex items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!date}
                        className="w-fit justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {date ? (
                          format(date, "PPP")
                        ) : (
                          <span>Last 24 hours</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                        endMonth={calendarRangeEnd}
                        startMonth={calendarRangeStart}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="w-full text-right">
                    <span className="text-lg font-semibold">
                      {int.format(stats.totalCount)}
                    </span>
                    <span className="pl-1">scores</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <div className="flex w-full">
                    <span className="grow">Scores with replays</span>
                    <span className="grow text-right font-semibold">
                      {int.format(stats.totalHasReplay)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">Scores with perfect combo</span>
                    <span className="grow text-right font-semibold">
                      {int.format(stats.totalPerfectCombo)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">SS</span>
                    <span className="grow text-right font-semibold">
                      {int.format(stats.totalSS)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">S</span>
                    <span className="grow text-right font-semibold">
                      {int.format(stats.totalS)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">A</span>
                    <span className="grow text-right font-semibold">
                      {int.format(stats.totalA)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">Average accuracy</span>
                    <span className="grow text-right font-semibold">
                      {pct.format(stats.averageAccuracy)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">Average combo</span>
                    <span className="grow text-right font-semibold">
                      {dec.format(stats.averageCombo)}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow">Average pp</span>
                    <span className="grow text-right font-semibold">
                      {stats.averagePp != null
                        ? `${dec.format(stats.averagePp)}pp`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex w-full pb-2">
                    <span className="grow">Max pp</span>
                    <span className="grow text-right font-semibold">
                      {stats.maxPp != null ? (
                        <a
                          href={`https://osu.ppy.sh/scores/${stats.maxPpScoreId}`}
                        >{`${dec.format(stats.maxPp)}pp`}</a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow pr-2">Most popular beatmap</span>
                    <span className="grow text-right font-semibold">
                      {stats.mostPopularBeatmapId != null ? (
                        <a
                          href={`https://osu.ppy.sh/beatmaps/${stats.mostPopularBeatmapId}`}
                        >{`${stats.mostPopularBeatmapId} (${dec.format(stats.mostPopularBeatmapIdPlaycount)} scores)`}</a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  <div className="flex w-full">
                    <span className="grow pr-2">Most active player</span>
                    <span className="grow text-right font-semibold">
                      {stats.mostPopularUserId != null ? (
                        <a
                          href={`https://osu.ppy.sh/users/${stats.mostPopularUserId}`}
                        >{`${stats.mostPopularUserId} (${dec.format(stats.mostPopularUserIdPlaycount)} scores)`}</a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </CardContent>
              </>
            )}
          </>
        )}
      </Card>
      <Card className="grow-10">
        <CardContent className="h-64 w-full pt-8 lg:h-86">
          {error ? (
            <CardContent>failed to load</CardContent>
          ) : (
            <>
              {isLoading ? (
                <Spinner />
              ) : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart
                    responsive
                    data={countByHour}
                    margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
                    style={{ overflow: "visible" }}
                  >
                    <CartesianGrid />
                    {showUnfiltered ? (
                      <Area
                        dataKey="unfiltered"
                        name="Total"
                        stroke="var(--color-pink-400)"
                        fill={
                          data.filtered ? "#00000000" : "var(--color-pink-400)"
                        }
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ) : (
                      <></>
                    )}
                    {data.filtered ? (
                      <Area
                        dataKey="filtered"
                        name="Filtered"
                        stroke="var(--color-violet-400)"
                        fill="var(--color-violet-400)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ) : (
                      <></>
                    )}
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(v) => hourFormatter.format(new Date(v))}
                    />
                    <YAxis width="auto" niceTicks="snap125" />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(v) => hourFormatter.format(new Date(v))}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Graphs({
  query,
  showUnfiltered,
}: {
  query: string;
  showUnfiltered: boolean;
}) {
  const { data, error, isLoading } = useSWR(`${ApiBase}?${query}`, fetcher, {
    refreshInterval: 5000,
    revalidateIfStale: false,
  });

  const countByMonth = data?.unfiltered?.countByMonth.map((item) => ({
    date: item.date,
    unfiltered: item.count,
    filtered: data.filtered
      ? (data.filtered.countByMonth.find((x) => x.date === item.date)?.count ??
        0)
      : null,
  }));

  const countByDay = data?.unfiltered?.countByDay.map((item) => ({
    date: item.date,
    unfiltered: item.count,
    filtered: data.filtered
      ? (data.filtered.countByDay.find((x) => x.date === item.date)?.count ?? 0)
      : null,
  }));

  const compactNumberFormatter = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  });
  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "long" });

  return (
    <div className="flex flex-wrap">
      <Card className="grow-1">
        <CardHeader className="text-lg">Monthly</CardHeader>
        <CardContent className="h-64 w-full lg:h-72">
          {error ? (
            <>failed to load</>
          ) : (
            <>
              {isLoading ? (
                <Spinner />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full fill-pink-600 stroke-pink-600"
                >
                  <AreaChart
                    responsive
                    data={countByMonth}
                    className="fill-pink-600 stroke-pink-600"
                    margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
                    style={{ overflow: "visible" }}
                  >
                    <CartesianGrid />
                    {showUnfiltered ? (
                      <Area
                        dataKey="unfiltered"
                        name="Total"
                        stroke="var(--color-pink-400)"
                        fill={
                          data.filtered ? "#00000000" : "var(--color-pink-400)"
                        }
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ) : (
                      <></>
                    )}
                    {data.filtered ? (
                      <Area
                        dataKey="filtered"
                        name="Filtered"
                        stroke="var(--color-violet-400)"
                        fill="var(--color-violet-400)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ) : (
                      <></>
                    )}
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => monthFormatter.format(new Date(v))}
                      width="auto"
                    />
                    <YAxis
                      tickFormatter={compactNumberFormatter.format}
                      niceTicks="snap125"
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(v) => monthFormatter.format(new Date(v))}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card className="grow-6">
        <CardHeader className="text-lg">Daily</CardHeader>
        <CardContent className="h-64 w-full lg:h-72">
          {error ? (
            <>failed to load</>
          ) : (
            <>
              {isLoading ? (
                <Spinner />
              ) : (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart
                    responsive
                    data={countByDay}
                    margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
                    style={{ overflow: "visible" }}
                  >
                    <CartesianGrid />
                    {showUnfiltered ? (
                      <Area
                        dataKey="unfiltered"
                        name="Total"
                        stroke="var(--color-pink-400)"
                        fill={
                          data.filtered ? "#00000000" : "var(--color-pink-400)"
                        }
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ) : (
                      <></>
                    )}
                    {data.filtered ? (
                      <Area
                        dataKey="filtered"
                        name="Filtered"
                        stroke="var(--color-violet-400)"
                        fill="var(--color-violet-400)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ) : (
                      <></>
                    )}
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => dayFormatter.format(new Date(v))}
                      width="auto"
                    />
                    <YAxis
                      tickFormatter={compactNumberFormatter.format}
                      niceTicks="snap125"
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent className="min-w-35 p-2" />}
                      labelFormatter={(v) => dayFormatter.format(new Date(v))}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const [ruleset, setRuleset] = useState<number | null>(null);
  const [modsInclude, setModsInclude] = useState<Array<Mod>>([]);
  const [modsExclude, setModsExclude] = useState<Array<Mod>>([]);
  const [showUnfiltered, setShowUnfiltered] = useState<boolean>(true);
  const [showModSettings, setShowModSettings] = useState<boolean>(false);

  let query = "";
  if (ruleset != null) query += `rulesetId=${ruleset}&`;

  if (modsInclude.length > 0) {
    query += modsInclude
      .filter((x) =>
        ruleset != null ? x.rulesets.indexOf(ruleset) != -1 : true,
      )
      .map((x) => `modsInclude=${x.acronym}&`)
      .join("");
  }

  if (modsExclude.length > 0) {
    query += modsExclude
      .filter((x) =>
        ruleset != null ? x.rulesets.indexOf(ruleset) != -1 : true,
      )
      .map((x) => `modsExclude=${x.acronym}&`)
      .join("");
  }

  const hasMods = modsInclude.length > 0 || modsExclude.length > 0;

  // reset to defaults if no filtering
  if (!hasMods && showModSettings) setShowModSettings(false);
  if (hasMods && showModSettings) query += `hasSettings=true&`;
  if (query == "" && !showUnfiltered) setShowUnfiltered(true);

  const handleRulesetChange = (e: any) => {
    const value = Number(e.target.value);
    if (value == ruleset) {
      setRuleset(null);
    } else {
      setRuleset(value);
      setModsInclude((prev) => prev.filter((x) => x.rulesets.includes(value)));
      setModsExclude((prev) => prev.filter((x) => x.rulesets.includes(value)));
    }
  };

  const handleModIncludeChange = (mod: Mod) => {
    setModsInclude((prev) =>
      prev.some((x) => x.acronym === mod.acronym)
        ? prev.filter((x) => x.acronym !== mod.acronym)
        : [...prev, mod],
    );
  };

  const handleModExcludeChange = (mod: Mod) => {
    setModsExclude((prev) =>
      prev.some((x) => x.acronym === mod.acronym)
        ? prev.filter((x) => x.acronym !== mod.acronym)
        : [...prev, mod],
    );
  };

  return (
    <>
      <div className="flex flex-wrap lg:flex-nowrap">
        <Card className="min-w-fit justify-center">
          <CardContent className="text-lg">scores!</CardContent>
        </Card>
        <Card className="min-w-fit">
          <CardContent>
            <ButtonGroup>
              <Button
                variant={ruleset == 0 ? "secondary" : "outline"}
                value="0"
                onClick={handleRulesetChange}
              >
                osu!
              </Button>
              <Button
                variant={ruleset == 1 ? "secondary" : "outline"}
                value="1"
                onClick={handleRulesetChange}
              >
                taiko
              </Button>
              <Button
                variant={ruleset == 2 ? "secondary" : "outline"}
                value="2"
                onClick={handleRulesetChange}
              >
                catch
              </Button>
              <Button
                variant={ruleset == 3 ? "secondary" : "outline"}
                value="3"
                onClick={handleRulesetChange}
              >
                mania
              </Button>
            </ButtonGroup>
          </CardContent>
        </Card>
        <Card className="grow md:hidden" />
        <Card className="min-w-fit">
          <CardContent>
            <ModsPopover
              ruleset={ruleset}
              name="Mods (include)"
              modsState={modsInclude}
              modButtonHandler={handleModIncludeChange}
            />
            <ModsPopover
              ruleset={ruleset}
              name="Mods (exclude)"
              modsState={modsExclude}
              modButtonHandler={handleModExcludeChange}
            />
          </CardContent>
        </Card>
        <Card className="grow" />
        {query ? (
          <Card className="w-full min-w-52 justify-center">
            <CardContent>
              <FieldGroup className="gap-2">
                <Field orientation="horizontal">
                  <Checkbox
                    checked={showUnfiltered}
                    onCheckedChange={setShowUnfiltered}
                    id="show-unfiltered"
                  />
                  <FieldLabel htmlFor="show-unfiltered">
                    Show unfiltered graph
                  </FieldLabel>
                </Field>
                {hasMods ? (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={showModSettings}
                      onCheckedChange={setShowModSettings}
                      id="show-mod-settings"
                    />
                    <FieldLabel htmlFor="show-mod-settings">
                      Only non-standard mod settings
                    </FieldLabel>
                  </Field>
                ) : (
                  <></>
                )}
              </FieldGroup>
            </CardContent>
          </Card>
        ) : (
          <></>
        )}
      </div>
      <Graphs query={query} showUnfiltered={showUnfiltered} />
      <Hourly query={query} showUnfiltered={showUnfiltered} />
    </>
  );
}
