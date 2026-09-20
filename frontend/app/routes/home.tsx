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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
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

export function meta() {
  return [
    { title: "osu! score stats" },
    { name: "description", content: "osu! score stats" },
  ];
}

const chartConfig = {} satisfies ChartConfig;

const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

function Hourly({
  query,
  showUnfiltered,
}: {
  query: string;
  showUnfiltered: boolean;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const { data, error, isLoading } = useSWR(
    `${ApiBase}/hourly?hourlyDate=${date.toISOString()}&${query}`,
    fetcher,
    { refreshInterval: 5000, revalidateIfStale: false },
  );

  const countByHour = data?.unfiltered?.countByHour.map((item, index) => ({
    hour: item.hour,
    unfiltered: item.count,
    filtered:
      data.filtered?.countByHour.length > 0
        ? data.filtered.countByHour[index]?.count
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
      <Card className="grow-1">
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
                <CardHeader>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!date}
                        className="w-fit justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                      />
                    </PopoverContent>
                  </Popover>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <div className="flex w-full items-center">
                    <span className="grow">Total scores</span>
                    <span className="grow text-right text-lg font-semibold">
                      {int.format(stats.totalCount)}
                    </span>
                  </div>
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
                      {dec.format(stats.averagePp)}pp
                    </span>
                  </div>
                </CardContent>
              </>
            )}
          </>
        )}
      </Card>
      <Card className="grow-7">
        <CardContent className="h-64 w-full pt-8 lg:h-82">
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

  const countByMonth = data?.unfiltered?.countByMonth.map((item, index) => ({
    date: item.date,
    unfiltered: item.count,
    filtered: data.filtered?.countByMonth[index]?.count,
  }));

  const countByDay = data?.unfiltered?.countByDay.map((item, index) => ({
    date: item.date,
    unfiltered: item.count,
    filtered: data.filtered?.countByDay[index]?.count,
  }));

  const compactNumberFormatter = new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  });
  const dayFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
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
  const [modsInclude, setModsInclude] = useState<Array<string>>([]);
  const [modsExclude, setModsExclude] = useState<Array<string>>([]);
  const [showUnfiltered, setShowUnfiltered] = useState<boolean>(true);

  let query = "";
  if (ruleset != null) query += `rulesetId=${ruleset}&`;

  if (modsInclude.length > 0) {
    query += modsInclude.map((x) => `modsInclude=${x}&`).join("");
  }

  if (modsExclude.length > 0) {
    query += modsExclude.map((x) => `modsExclude=${x}&`).join("");
  }

  const handleRulesetChange = (e: any) => {
    if (e.target.value == ruleset) {
      setRuleset(null);
    } else {
      setRuleset(e.target.value);
    }
  };

  const handleModIncludeChange = (e: any) => {
    setModsInclude((prev) =>
      prev.includes(e.target.value)
        ? prev.filter((item) => item !== e.target.value)
        : [...prev, e.target.value],
    );
  };

  const handleModExcludeChange = (e: any) => {
    setModsExclude((prev) =>
      prev.includes(e.target.value)
        ? prev.filter((item) => item !== e.target.value)
        : [...prev, e.target.value],
    );
  };

  const mods = [
    {
      name: "Reduction",
      color: "text-mod-decrease",
      types: ["EZ", "NF", "HT", "DC"],
    },
    {
      name: "Increase",
      color: "text-mod-increase",
      types: ["HR", "SD", "PF", "DT", "NC", "HD", "TC", "FL", "BL", "ST", "AC"],
    },
    {
      name: "Automation",
      color: "text-mod-automation",
      types: ["AP", "RX", "SO"],
    },
    {
      name: "Conversion",
      color: "text-mod-conversion",
      types: ["TP", "DA", "CL", "RD", "MR", "AL", "SG"],
    },
    {
      name: "Fun",
      color: "text-mod-fun",
      types: ["BR", /* ... */ "MU"],
    },
    {
      name: "Other",
      color: "text-mod-other",
      types: ["TD"],
    },
  ] as const;

  return (
    <>
      <div className="flex flex-wrap lg:flex-nowrap">
        <Card className="min-w-fit">
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
        <Card className="min-w-fit">
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-fit justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                >
                  <span>Mods (include)</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto" align="start">
                {mods.map((category) => {
                  return (
                    <div className="flex items-center">
                      <div className={`px-2 ${category.color} min-w-26`}>
                        {category.name}
                      </div>
                      <div className="flex flex-wrap">
                        {category.types.map((mod: string) => {
                          return (
                            <td>
                              <Button
                                className="w-12"
                                variant={
                                  modsInclude.includes(mod)
                                    ? "secondary"
                                    : "outline"
                                }
                                value={mod}
                                onClick={handleModIncludeChange}
                              >
                                {mod}
                              </Button>
                            </td>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-fit justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                >
                  <span>Mods (exclude)</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto" align="start">
                {mods.map((category) => {
                  return (
                    <div className="flex items-center">
                      <div className={`px-2 ${category.color} min-w-26`}>
                        {category.name}
                      </div>
                      <div className="flex flex-wrap">
                        {category.types.map((mod: string) => {
                          return (
                            <td>
                              <Button
                                className="w-12"
                                variant={
                                  modsExclude.includes(mod)
                                    ? "secondary"
                                    : "outline"
                                }
                                value={mod}
                                onClick={handleModExcludeChange}
                              >
                                {mod}
                              </Button>
                            </td>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        <Card className="w-full min-w-52">
          {query ? (
            <FieldGroup className="mx-4">
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
            </FieldGroup>
          ) : (
            <></>
          )}
        </Card>
      </div>
      <Graphs query={query} showUnfiltered={showUnfiltered} />
      <Hourly query={query} showUnfiltered={showUnfiltered} />
    </>
  );
}
