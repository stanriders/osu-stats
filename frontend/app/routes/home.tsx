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

  if (error) return <div>failed to load</div>;
  /*if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );*/

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
            <CardContent>
              <p>Total scores: {int.format(stats.totalCount)}</p>
              <p>Scores with replays: {int.format(stats.totalHasReplay)}</p>
              <p>
                Scores with perfect combo: {int.format(stats.totalPerfectCombo)}
              </p>
              <p>SS: {int.format(stats.totalSS)}</p>
              <p>S: {int.format(stats.totalS)}</p>
              <p>A: {int.format(stats.totalA)}</p>
              <p>Average accuracy: {pct.format(stats.averageAccuracy)}</p>
              <p>Average combo: {dec.format(stats.averageCombo)}</p>
              <p>Average pp: {dec.format(stats.averagePp)}pp</p>
            </CardContent>
          </>
        )}
      </Card>
      <Card className="grow-7">
        <CardContent className="h-64 w-full lg:h-82">
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
                  <Line dataKey="unfiltered" name="Total" />
                ) : (
                  <></>
                )}
                {data.filtered ? (
                  <Area dataKey="filtered" name="Filtered" />
                ) : (
                  <></>
                )}
                <XAxis
                  dataKey="hour"
                  tickFormatter={(v) => hourFormatter.format(new Date(v))}
                />
                <YAxis width="auto" niceTicks="snap125"/>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(v) => hourFormatter.format(new Date(v))}
                />
              </AreaChart>
            </ChartContainer>
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

  if (error) return <div>failed to load</div>;
  /*if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );*/

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
        <CardHeader>Monthly</CardHeader>
        <CardContent className="h-64 w-full lg:h-72">
          {isLoading ? (
            <Spinner />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart
                responsive
                data={countByMonth}
                margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
                style={{ overflow: "visible" }}
              >
                <CartesianGrid />
                {showUnfiltered ? (
                  <Line dataKey="unfiltered" name="Total" />
                ) : (
                  <></>
                )}
                {data.filtered ? (
                  <Area dataKey="filtered" name="Filtered" />
                ) : (
                  <></>
                )}
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => monthFormatter.format(new Date(v))}
                  width="auto" 
                />
                <YAxis tickFormatter={compactNumberFormatter.format} niceTicks="snap125"/>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(v) => monthFormatter.format(new Date(v))}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Card className="grow-6">
        <CardHeader>Daily</CardHeader>
        <CardContent className="h-64 w-full lg:h-72">
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
                  <Line dataKey="unfiltered" name="Total" />
                ) : (
                  <></>
                )}
                {data.filtered ? (
                  <Area dataKey="filtered" name="Filtered" />
                ) : (
                  <></>
                )}
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => dayFormatter.format(new Date(v))}
                  width="auto" 
                />
                <YAxis tickFormatter={compactNumberFormatter.format} niceTicks="snap125"/>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(v) => dayFormatter.format(new Date(v))}
                />
              </AreaChart>
            </ChartContainer>
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
    {name: "Reduction", types: ["DC", "EZ", "NF", "HT"]},
    {name: "Increase", types:  ["HR", "SD", "PF", "DT", "NC", "HD", "TC", "FL", "BL", "ST", "AC"]},
    {name: "Automation", types:  ["AP", "RX", "SO"]},
    {name: "Conversion", types:  ["TP", "DA", "CL", "RD", "MR", "AL", "SG"]},
    {name: "Fun", types:  ["BR",/* ... */ "MU"]},
    {name: "Other", types:  ["TD"]}
  ]

  return (
    <>
      <div className="flex flex-wrap">
        <Card className="min-w-fit">
          <CardContent>
            <h1>osu! stats</h1>
          </CardContent>
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
        <Card className="max-w-lg min-w-52 flex-none">
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
        </Card>
</div>
      <div className="flex">
        <Card className="w-1/2">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <CardHeader>Mods (include)</CardHeader>
            </CollapsibleTrigger>
            <CardContent>
              <CollapsibleContent className="w-fit">
                <table>
                  <tbody>
                  {mods.map((category)=>{
                    return (
                    <tr>
                      <th className="px-2">{category.name}</th>
                      <div className="flex flex-wrap">
                      { category.types.map((mod: string) => {
                        return (<td>
                          <Button className="w-12" variant={ modsInclude.includes(mod) ? "secondary" : "outline" } value={mod} onClick={handleModIncludeChange}>{mod}</Button>
                        </td>)
                        })
                      }
                      </div>
                    </tr>)}
                  )}
                  </tbody>
                </table>
              </CollapsibleContent>
            </CardContent>
          </Collapsible>
        </Card>
        <Card className="w-1/2">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <CardHeader>Mods (exclude)</CardHeader>
            </CollapsibleTrigger>
            <CardContent>
              <CollapsibleContent>
                <table>
                  <tbody>
                  {mods.map((category)=>{
                    return (
                    <tr>
                      <th className="px-2">{category.name}</th>
                      <div className="flex flex-wrap">
                      { category.types.map((mod: string) => {
                        return (<td>
                          <Button className="w-12" variant={ modsExclude.includes(mod) ? "secondary" : "outline" } value={mod} onClick={handleModExcludeChange}>{mod}</Button>
                        </td>)
                        })
                      }
                      </div>
                    </tr>)}
                  )}
                  </tbody>
                </table>
              </CollapsibleContent>
            </CardContent>
          </Collapsible>
        </Card>
      </div>
      <Graphs query={query} showUnfiltered={showUnfiltered} />
      <Hourly query={query} showUnfiltered={showUnfiltered} />
    </>
  );
}
