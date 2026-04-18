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
        <Card>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-3xl">
              <h1>Daily</h1>
              <LineChart responsive data={data.count}>
                <Line dataKey="count" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-3xl">
              <h1>Monthly</h1>
              <LineChart responsive data={data.countByMonth}>
                <Line dataKey="count" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-3xl">
              <h1>Hourly</h1>
              <LineChart responsive data={data.countByHour}>
                <Line dataKey="count" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
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
  const [modsExclude, setModsExclude] = useState<Array<string>>([]);

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
        <CardHeader>Mods (include)</CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Mods (exclude)</CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      <Graphs query={query}/>
    </>
  );
}
