import type { Route } from "./+types/home";
import useSWR from 'swr';
import { Spinner } from "~/components/ui/spinner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import { type ChartConfig } from "~/components/ui/chart"
import { ButtonGroup } from "~/components/ui/button-group"
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "osu! score stats" },
    { name: "description", content: "osu! score stats" },
  ];
}

const chartConfig = {} satisfies ChartConfig

const fetcher = (...args : any[]) => fetch(...args).then(res => res.json());

function Graphs({query}) {
  const { data, error, isLoading } = useSWR(`https://osustats.stanr.info/api?${query}`, fetcher, { refreshInterval: 5000, revalidateIfStale: false })

  if (error) return <div>failed to load</div>
  if (isLoading) return <div><Spinner /></div>

  return <div className='flex flex-wrap'>
        <ChartContainer config={chartConfig} className="w-3xl">
          <h1>Daily</h1>
          <LineChart responsive data={data.count}>
            <Line dataKey="count" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="w-3xl">
          <h1>Monthly</h1>
          <LineChart responsive data={data.countByMonth}>
            <Line dataKey="count" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
        <ChartContainer config={chartConfig} className="w-3xl">
          <h1>Hourly</h1>
          <LineChart responsive data={data.countByHour}>
            <Line dataKey="count" />
            <XAxis dataKey="hour" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
        <Card>
          <CardContent>
            <p>Total scores: {data.totalCount}</p>
            <p>Scores with replays: {data.totalHasReplay}</p>
            <p>Scores with perfect combo: {data.totalPerfectCombo}</p>
            <p>SS: {data.totalSS}</p>
            <p>S: {data.totalS}</p>
            <p>A: {data.totalA}</p>
            <p>Average accuracy: {data.averageAccuracy * 100}</p>
            <p>Average combo: {data.averageCombo}</p>
            <p>Average pp: {data.averagePp}</p>
          </CardContent>
        </Card>
      </div>;
}

export default function Home() {
  const [ruleset, setRuleset] = useState<number | null>(null);
  const [modsInclude, setModsInclude] = useState<Array<string>>([]);

  let query = "";
  if (ruleset != null)
    query += `rulesetId=${ruleset}&`;

  if (modsInclude.length > 0) {
    query += modsInclude.map(x => `modsInclude=${x}&`).join("");
  }

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
      <Card>
        <CardContent>
          <ButtonGroup>
            <Button variant={ruleset == 0 ? "secondary" : "outline"} value="0" onClick={handleRulesetChange}>osu!</Button>
            <Button variant={ruleset == 1 ? "secondary" : "outline"} value="1" onClick={handleRulesetChange}>taiko</Button>
            <Button variant={ruleset == 2 ? "secondary" : "outline"} value="2" onClick={handleRulesetChange}>catch</Button>
            <Button variant={ruleset == 3 ? "secondary" : "outline"} value="3" onClick={handleRulesetChange}>mania</Button>
          </ButtonGroup>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Mods</CardHeader>
        <CardContent>
          <ButtonGroup>
            <Button variant={modsInclude.includes("DC") ? "secondary" : "outline"} value="DC" onClick={handleModChange}>DC</Button>
            <Button variant={modsInclude.includes("EZ") ? "secondary" : "outline"} value="EZ" onClick={handleModChange}>EZ</Button>
            <Button variant={modsInclude.includes("NF") ? "secondary" : "outline"} value="NF" onClick={handleModChange}>NF</Button>
            <Button variant={modsInclude.includes("HT") ? "secondary" : "outline"} value="HT" onClick={handleModChange}>HT</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant={modsInclude.includes("AC") ? "secondary" : "outline"} value="AC" onClick={handleModChange}>AC</Button>
            <Button variant={modsInclude.includes("BL") ? "secondary" : "outline"} value="BL" onClick={handleModChange}>BL</Button>
            <Button variant={modsInclude.includes("DT") ? "secondary" : "outline"} value="DT" onClick={handleModChange}>DT</Button>
            <Button variant={modsInclude.includes("HD") ? "secondary" : "outline"} value="HD" onClick={handleModChange}>HD</Button>
            <Button variant={modsInclude.includes("HR") ? "secondary" : "outline"} value="HR" onClick={handleModChange}>HR</Button>
            <Button variant={modsInclude.includes("NC") ? "secondary" : "outline"} value="NC" onClick={handleModChange}>NC</Button>
            <Button variant={modsInclude.includes("PF") ? "secondary" : "outline"} value="PF" onClick={handleModChange}>PF</Button>
            <Button variant={modsInclude.includes("SD") ? "secondary" : "outline"} value="SD" onClick={handleModChange}>SD</Button>
            <Button variant={modsInclude.includes("ST") ? "secondary" : "outline"} value="ST" onClick={handleModChange}>ST</Button>
            <Button variant={modsInclude.includes("TC") ? "secondary" : "outline"} value="TC" onClick={handleModChange}>TC</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant={modsInclude.includes("AL") ? "secondary" : "outline"} value="AL" onClick={handleModChange}>AL</Button>
            <Button variant={modsInclude.includes("CL") ? "secondary" : "outline"} value="CL" onClick={handleModChange}>CL</Button>
            <Button variant={modsInclude.includes("DA") ? "secondary" : "outline"} value="DA" onClick={handleModChange}>DA</Button>
            <Button variant={modsInclude.includes("MR") ? "secondary" : "outline"} value="MR" onClick={handleModChange}>MR</Button>
            <Button variant={modsInclude.includes("RD") ? "secondary" : "outline"} value="RD" onClick={handleModChange}>RD</Button>
            <Button variant={modsInclude.includes("SG") ? "secondary" : "outline"} value="SG" onClick={handleModChange}>SG</Button>
            <Button variant={modsInclude.includes("TP") ? "secondary" : "outline"} value="TP" onClick={handleModChange}>TP</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant={modsInclude.includes("AP") ? "secondary" : "outline"} value="AP" onClick={handleModChange}>AP</Button>
            <Button variant={modsInclude.includes("RX") ? "secondary" : "outline"} value="RX" onClick={handleModChange}>RX</Button>
            <Button variant={modsInclude.includes("SO") ? "secondary" : "outline"} value="SO" onClick={handleModChange}>SO</Button>
          </ButtonGroup>
          <ButtonGroup>
            fun mods
          </ButtonGroup>
        </CardContent>
      </Card>
      <Graphs query={query}/>
    </>
  );
}
