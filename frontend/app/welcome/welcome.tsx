import useSWR from 'swr';
import { Spinner } from "~/components/ui/spinner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import { type ChartConfig } from "~/components/ui/chart"
import { ButtonGroup } from "~/components/ui/button-group"
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { Card, CardContent } from '~/components/ui/card';

const chartConfig = {} satisfies ChartConfig

const fetcher = (...args : any[]) => fetch(...args).then(res => res.json());

export function Welcome() {
  const [ruleset, setRuleset] = useState<number | null>(null);
  const [modsInclude, setModsInclude] = useState<Array<string>>([]);

  let query = "";
  if (ruleset != null)
    query += `rulesetId=${ruleset}&`;

  if (modsInclude.length > 0) {
    query += modsInclude.map(x => `modsInclude=${x}&`).join("");
  }

  const { data, error, isLoading } = useSWR(`https://osustats.stanr.info/api?${query}`, fetcher, { refreshInterval: 15000, revalidateIfStale: false })

  if (error) return <div>failed to load</div>
  if (isLoading) return <div><Spinner /></div>

  const handleRulesetChange = (e: any) => {
    if (e.target.value == ruleset) {
      setRuleset(null);
    } else {
      setRuleset(e.target.value);
    }
  };

  const handleModChange = (e: any) => {
      setModsInclude(prev =>
        prev.includes(e.target.value)
          ? prev.filter(item => item !== e.target.value)
          : [...prev, e.target.value]
      );
  };

  return (
    <>
      <ButtonGroup>
        <Button variant={ruleset == 0 ? "secondary" : "outline"} value="0" onClick={handleRulesetChange}>osu!</Button>
        <Button variant={ruleset == 1 ? "secondary" : "outline"} value="1" onClick={handleRulesetChange}>taiko</Button>
        <Button variant={ruleset == 2 ? "secondary" : "outline"} value="2" onClick={handleRulesetChange}>catch</Button>
        <Button variant={ruleset == 3 ? "secondary" : "outline"} value="3" onClick={handleRulesetChange}>mania</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant={modsInclude.includes("DT") ? "secondary" : "outline"} value="DT" onClick={handleModChange}>DT</Button>
        <Button variant={modsInclude.includes("CL") ? "secondary" : "outline"} value="CL" onClick={handleModChange}>CL</Button>
        <Button variant={modsInclude.includes("HR") ? "secondary" : "outline"} value="HR" onClick={handleModChange}>HR</Button>
        <Button variant={modsInclude.includes("HD") ? "secondary" : "outline"} value="HD" onClick={handleModChange}>HD</Button>
        <Button variant={modsInclude.includes("AC") ? "secondary" : "outline"} value="AC" onClick={handleModChange}>AC</Button>
      </ButtonGroup>
      <div className='flex flex-wrap'>
        <ChartContainer config={chartConfig} className="w-3xl">
          <Label>Daily</Label>
          <LineChart responsive data={data.count}>
            <Line dataKey="count" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="w-3xl">
          <Label>Monthly</Label>
          <LineChart responsive data={data.countByMonth}>
            <Line dataKey="count" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="w-3xl">
          <Label>Hourly</Label>
          <LineChart responsive data={data.countByHour}>
            <Line dataKey="count" />
            <XAxis dataKey="hour" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
        <Card>
          <CardContent>
            <Label>Total scores: {data.totalCount}</Label>
            <Label>Scores with replays: {data.totalHasReplay}</Label>
            <Label>Scores with perfect combo: {data.totalPerfectCombo}</Label>
            <Label>SS: {data.totalSS}</Label>
            <Label>S: {data.totalS}</Label>
            <Label>A: {data.totalA}</Label>
            <Label>Average accuracy: {data.averageAccuracy * 100}</Label>
            <Label>Average combo: {data.averageCombo}</Label>
            <Label>Average pp: {data.averagePp}</Label>
          </CardContent>
        </Card>
      </div>
    </>
  );
}