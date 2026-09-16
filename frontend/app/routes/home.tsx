import type { Route } from "./+types/home";
import useSWR from 'swr';
import { Spinner } from "~/components/ui/spinner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart';
import { Area, AreaChart, Line, LineChart, XAxis, YAxis } from 'recharts';
import { type ChartConfig } from "~/components/ui/chart"
import { ButtonGroup } from "~/components/ui/button-group"
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns"
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { ApiBase } from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "osu! score stats" },
    { name: "description", content: "osu! score stats" },
  ];
}

const chartConfig = {} satisfies ChartConfig

const fetcher = (...args : any[]) => fetch(...args).then(res => res.json());

function Hourly({query, showUnfiltered} : { query: string; showUnfiltered: boolean }) {
  const [date, setDate] = useState<Date>(new Date);
  const { data, error, isLoading } = useSWR(`${ApiBase}/hourly?hourlyDate=${date.toISOString()}&${query}`, fetcher, { refreshInterval: 5000, revalidateIfStale: false })

  if (error) return <div>failed to load</div>
  if (isLoading) return <div><Spinner /></div>

  const countByHour = data.unfiltered.countByHour.map((item, index) => ({
    hour: item.hour,
    unfiltered: item.count,
    filtered: data.filtered?.countByHour.length > 0 ? data.filtered.countByHour[index]?.count : null
  }));
    
  const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });

  const stats = data.filtered ?? data.unfiltered;
  const int = new Intl.NumberFormat(undefined);
  const dec = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 2 });

  return (
  <div className='flex flex-wrap'>
    <Card className="w-fit">
      <CardHeader>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!date}
              className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
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
            <p>Scores with perfect combo: {int.format(stats.totalPerfectCombo)}</p>
            <p>SS: {int.format(stats.totalSS)}</p>
            <p>S: {int.format(stats.totalS)}</p>
            <p>A: {int.format(stats.totalA)}</p>
            <p>Average accuracy: {pct.format(stats.averageAccuracy)}</p>
            <p>Average combo: {dec.format(stats.averageCombo)}</p>
            <p>Average pp: {dec.format(stats.averagePp)}pp</p>
      </CardContent>
    </Card>
    <Card className="grow">
      <CardHeader>Hourly</CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-64">
          <AreaChart responsive data={countByHour} margin={{ top: 10, right: 30, bottom: 10, left: 10 }} style={{ overflow: 'visible' }}>
                {showUnfiltered ? <Line dataKey="unfiltered" name="Total" /> : <></>}
                {data.filtered ? <Area dataKey="filtered" name="Filtered" /> : <></>}
              <XAxis dataKey="hour" tickFormatter={(v) => hourFormatter.format(new Date(v))} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(v) => hourFormatter.format(new Date(v))}/>
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
  </div>);
}

function Graphs({query, showUnfiltered} : { query: string; showUnfiltered: boolean }) {
  const { data, error, isLoading } = useSWR(`${ApiBase}?${query}`, fetcher, { refreshInterval: 5000, revalidateIfStale: false })

  if (error) return <div>failed to load</div>
  if (isLoading) return <div><Spinner /></div>

  const countByMonth = data.unfiltered.countByMonth.map((item, index) => ({
    date: item.date,
    unfiltered: item.count,
    filtered: data.filtered?.countByMonth[index]?.count
  }));

  const countByDay = data.unfiltered.countByDay.map((item, index) => ({
    date: item.date,
    unfiltered: item.count,
    filtered: data.filtered?.countByDay[index]?.count
  }));

  const compactNumberFormatter = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 });
  const dayFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long' });

  return <div className='flex flex-wrap'>
        <Card className="grow">
          <CardHeader>Monthly</CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-64">
              <AreaChart responsive data={countByMonth} margin={{ top: 10, right: 30, bottom: 10, left: 10 }} style={{ overflow: 'visible' }}>
                {showUnfiltered ? <Line dataKey="unfiltered" name="Total" /> : <></>}
                {data.filtered ? <Area dataKey="filtered" name="Filtered" /> : <></>}
                <XAxis dataKey="date" tickFormatter={(v) => monthFormatter.format(new Date(v))} textAnchor="middle"/>
                <YAxis tickFormatter={compactNumberFormatter.format} />
                <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(v) => monthFormatter.format(new Date(v))}/>
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="grow">
          <CardHeader>Daily</CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-64">
              <AreaChart responsive data={countByDay} margin={{ top: 10, right: 30, bottom: 10, left: 10 }} style={{ overflow: 'visible' }}>
                {showUnfiltered ? <Line dataKey="unfiltered" name="Total" /> : <></>}
                {data.filtered ? <Area dataKey="filtered" name="Filtered" /> : <></>}
                <XAxis dataKey="date" tickFormatter={(v) => dayFormatter.format(new Date(v))}/>
                <YAxis tickFormatter={compactNumberFormatter.format}/>
                <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(v) => dayFormatter.format(new Date(v))}/>
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>;
}

export default function Home() {
  const [ruleset, setRuleset] = useState<number | null>(null);
  const [modsInclude, setModsInclude] = useState<Array<string>>([]);
  const [modsExclude, setModsExclude] = useState<Array<string>>([]);
  const [showUnfiltered, setShowUnfiltered] = useState<boolean>(true);

  let query = "";
  if (ruleset != null)
    query += `rulesetId=${ruleset}&`;

  if (modsInclude.length > 0) {
    query += modsInclude.map(x => `modsInclude=${x}&`).join("");
  }

  if (modsExclude.length > 0) {
    query += modsExclude.map(x => `modsExclude=${x}&`).join("");
  }

  const handleRulesetChange = (e: any) => {
    if (e.target.value == ruleset) {
      setRuleset(null);
    } else {
      setRuleset(e.target.value);
    }
  };

  const handleModIncludeChange = (e: any) => {
      setModsInclude(prev =>
        prev.includes(e.target.value)
          ? prev.filter(item => item !== e.target.value)
          : [...prev, e.target.value]
      );
  };

  const handleModExcludeChange = (e: any) => {
      setModsExclude(prev =>
        prev.includes(e.target.value)
          ? prev.filter(item => item !== e.target.value)
          : [...prev, e.target.value]
      );
  };
  return (
    <>
      <div className="flex">
      <Card className="min-w-fit">
        <CardContent>
          <ButtonGroup>
            <Button variant={ruleset == 0 ? "secondary" : "outline"} value="0" onClick={handleRulesetChange}>osu!</Button>
            <Button variant={ruleset == 1 ? "secondary" : "outline"} value="1" onClick={handleRulesetChange}>taiko</Button>
            <Button variant={ruleset == 2 ? "secondary" : "outline"} value="2" onClick={handleRulesetChange}>catch</Button>
            <Button variant={ruleset == 3 ? "secondary" : "outline"} value="3" onClick={handleRulesetChange}>mania</Button>
          </ButtonGroup>
        </CardContent>
      </Card>
      <Card className="w-full max-w-lg">
        <Collapsible>
          <CollapsibleTrigger className="w-full"><CardHeader>Mods (include)</CardHeader></CollapsibleTrigger>
          <CardContent>
            <CollapsibleContent>
                  <ButtonGroup>
                    <Button variant={modsInclude.includes("DC") ? "secondary" : "outline"} value="DC" onClick={handleModIncludeChange}>DC</Button>
                    <Button variant={modsInclude.includes("EZ") ? "secondary" : "outline"} value="EZ" onClick={handleModIncludeChange}>EZ</Button>
                    <Button variant={modsInclude.includes("NF") ? "secondary" : "outline"} value="NF" onClick={handleModIncludeChange}>NF</Button>
                    <Button variant={modsInclude.includes("HT") ? "secondary" : "outline"} value="HT" onClick={handleModIncludeChange}>HT</Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    <Button variant={modsInclude.includes("AC") ? "secondary" : "outline"} value="AC" onClick={handleModIncludeChange}>AC</Button>
                    <Button variant={modsInclude.includes("BL") ? "secondary" : "outline"} value="BL" onClick={handleModIncludeChange}>BL</Button>
                    <Button variant={modsInclude.includes("DT") ? "secondary" : "outline"} value="DT" onClick={handleModIncludeChange}>DT</Button>
                    <Button variant={modsInclude.includes("HD") ? "secondary" : "outline"} value="HD" onClick={handleModIncludeChange}>HD</Button>
                    <Button variant={modsInclude.includes("HR") ? "secondary" : "outline"} value="HR" onClick={handleModIncludeChange}>HR</Button>
                    <Button variant={modsInclude.includes("NC") ? "secondary" : "outline"} value="NC" onClick={handleModIncludeChange}>NC</Button>
                    <Button variant={modsInclude.includes("PF") ? "secondary" : "outline"} value="PF" onClick={handleModIncludeChange}>PF</Button>
                    <Button variant={modsInclude.includes("SD") ? "secondary" : "outline"} value="SD" onClick={handleModIncludeChange}>SD</Button>
                    <Button variant={modsInclude.includes("ST") ? "secondary" : "outline"} value="ST" onClick={handleModIncludeChange}>ST</Button>
                    <Button variant={modsInclude.includes("TC") ? "secondary" : "outline"} value="TC" onClick={handleModIncludeChange}>TC</Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    <Button variant={modsInclude.includes("AL") ? "secondary" : "outline"} value="AL" onClick={handleModIncludeChange}>AL</Button>
                    <Button variant={modsInclude.includes("CL") ? "secondary" : "outline"} value="CL" onClick={handleModIncludeChange}>CL</Button>
                    <Button variant={modsInclude.includes("DA") ? "secondary" : "outline"} value="DA" onClick={handleModIncludeChange}>DA</Button>
                    <Button variant={modsInclude.includes("MR") ? "secondary" : "outline"} value="MR" onClick={handleModIncludeChange}>MR</Button>
                    <Button variant={modsInclude.includes("RD") ? "secondary" : "outline"} value="RD" onClick={handleModIncludeChange}>RD</Button>
                    <Button variant={modsInclude.includes("SG") ? "secondary" : "outline"} value="SG" onClick={handleModIncludeChange}>SG</Button>
                    <Button variant={modsInclude.includes("TP") ? "secondary" : "outline"} value="TP" onClick={handleModIncludeChange}>TP</Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    <Button variant={modsInclude.includes("AP") ? "secondary" : "outline"} value="AP" onClick={handleModIncludeChange}>AP</Button>
                    <Button variant={modsInclude.includes("RX") ? "secondary" : "outline"} value="RX" onClick={handleModIncludeChange}>RX</Button>
                    <Button variant={modsInclude.includes("SO") ? "secondary" : "outline"} value="SO" onClick={handleModIncludeChange}>SO</Button>
                  </ButtonGroup>
                  <ButtonGroup>
                    fun mods
                  </ButtonGroup>
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      </Card>
      <Card className="w-full max-w-lg">
        <Collapsible>
        <CollapsibleTrigger className="w-full"><CardHeader>Mods (exclude)</CardHeader></CollapsibleTrigger>
        <CardContent>
            <CollapsibleContent>
          <ButtonGroup>
            <Button variant={modsExclude.includes("DC") ? "secondary" : "outline"} value="DC" onClick={handleModExcludeChange}>DC</Button>
            <Button variant={modsExclude.includes("EZ") ? "secondary" : "outline"} value="EZ" onClick={handleModExcludeChange}>EZ</Button>
            <Button variant={modsExclude.includes("NF") ? "secondary" : "outline"} value="NF" onClick={handleModExcludeChange}>NF</Button>
            <Button variant={modsExclude.includes("HT") ? "secondary" : "outline"} value="HT" onClick={handleModExcludeChange}>HT</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant={modsExclude.includes("AC") ? "secondary" : "outline"} value="AC" onClick={handleModExcludeChange}>AC</Button>
            <Button variant={modsExclude.includes("BL") ? "secondary" : "outline"} value="BL" onClick={handleModExcludeChange}>BL</Button>
            <Button variant={modsExclude.includes("DT") ? "secondary" : "outline"} value="DT" onClick={handleModExcludeChange}>DT</Button>
            <Button variant={modsExclude.includes("HD") ? "secondary" : "outline"} value="HD" onClick={handleModExcludeChange}>HD</Button>
            <Button variant={modsExclude.includes("HR") ? "secondary" : "outline"} value="HR" onClick={handleModExcludeChange}>HR</Button>
            <Button variant={modsExclude.includes("NC") ? "secondary" : "outline"} value="NC" onClick={handleModExcludeChange}>NC</Button>
            <Button variant={modsExclude.includes("PF") ? "secondary" : "outline"} value="PF" onClick={handleModExcludeChange}>PF</Button>
            <Button variant={modsExclude.includes("SD") ? "secondary" : "outline"} value="SD" onClick={handleModExcludeChange}>SD</Button>
            <Button variant={modsExclude.includes("ST") ? "secondary" : "outline"} value="ST" onClick={handleModExcludeChange}>ST</Button>
            <Button variant={modsExclude.includes("TC") ? "secondary" : "outline"} value="TC" onClick={handleModExcludeChange}>TC</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant={modsExclude.includes("AL") ? "secondary" : "outline"} value="AL" onClick={handleModExcludeChange}>AL</Button>
            <Button variant={modsExclude.includes("CL") ? "secondary" : "outline"} value="CL" onClick={handleModExcludeChange}>CL</Button>
            <Button variant={modsExclude.includes("DA") ? "secondary" : "outline"} value="DA" onClick={handleModExcludeChange}>DA</Button>
            <Button variant={modsExclude.includes("MR") ? "secondary" : "outline"} value="MR" onClick={handleModExcludeChange}>MR</Button>
            <Button variant={modsExclude.includes("RD") ? "secondary" : "outline"} value="RD" onClick={handleModExcludeChange}>RD</Button>
            <Button variant={modsExclude.includes("SG") ? "secondary" : "outline"} value="SG" onClick={handleModExcludeChange}>SG</Button>
            <Button variant={modsExclude.includes("TP") ? "secondary" : "outline"} value="TP" onClick={handleModExcludeChange}>TP</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant={modsExclude.includes("AP") ? "secondary" : "outline"} value="AP" onClick={handleModExcludeChange}>AP</Button>
            <Button variant={modsExclude.includes("RX") ? "secondary" : "outline"} value="RX" onClick={handleModExcludeChange}>RX</Button>
            <Button variant={modsExclude.includes("SO") ? "secondary" : "outline"} value="SO" onClick={handleModExcludeChange}>SO</Button>
          </ButtonGroup>
          <ButtonGroup>
            fun mods
          </ButtonGroup>
          </CollapsibleContent>
        </CardContent>
        </Collapsible>
      </Card>
      </div>
      <FieldGroup className="mx-auto">
        <Field orientation="horizontal">
          <Checkbox checked={showUnfiltered} onCheckedChange={setShowUnfiltered} id="show-unfiltered"/>
          <FieldLabel htmlFor="show-unfiltered">Show unfiltered graph</FieldLabel>
        </Field>
      </FieldGroup>
      <Graphs query={query} showUnfiltered={showUnfiltered}/>
      <Hourly query={query} showUnfiltered={showUnfiltered}/>
    </>
  );
}
