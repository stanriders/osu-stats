import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";

const chartConfig = {} satisfies ChartConfig;

export default function ScoreGraph({
  data,
  showUnfiltered,
  hasFiltered,
  xAxisFormatter,
  xAxisDataKey,
  yAxisFormatter,
  tooltipFormatter,
}: {
  data: any;
  showUnfiltered: boolean;
  hasFiltered: boolean;
  xAxisFormatter: Intl.DateTimeFormat;
  xAxisDataKey: string;
  yAxisFormatter?: Intl.NumberFormat;
  tooltipFormatter: Intl.DateTimeFormat;
}) {
  const fillOpacity = 0.2;
  const strokeWidth = 2;
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart
        responsive
        data={data}
        margin={{ left: 5, right: 30 }}
        style={{ overflow: "visible" }}
      >
        <CartesianGrid />
        {showUnfiltered ? (
          <Area
            dataKey="unfiltered"
            name="Total"
            stroke="var(--color-pink-400)"
            fill={hasFiltered ? "#00000000" : "var(--color-pink-400)"}
            fillOpacity={fillOpacity}
            strokeWidth={strokeWidth}
          />
        ) : (
          <></>
        )}
        {hasFiltered ? (
          <Area
            dataKey="filtered"
            name="Filtered"
            stroke="var(--color-violet-400)"
            fill="var(--color-violet-400)"
            fillOpacity={fillOpacity}
            strokeWidth={strokeWidth}
          />
        ) : (
          <></>
        )}
        <XAxis
          dataKey={xAxisDataKey}
          tickFormatter={(v) => xAxisFormatter.format(new Date(v))}
          width="auto"
        />
        <YAxis
          tickFormatter={yAxisFormatter?.format}
          niceTicks="snap125"
          width="auto"
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          labelFormatter={(v) => tooltipFormatter.format(new Date(v))}
        />
      </AreaChart>
    </ChartContainer>
  );
}
