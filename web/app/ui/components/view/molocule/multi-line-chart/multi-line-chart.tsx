'use client';
import { EventProps, LineChart } from '@tremor/react';
import { useState } from 'react';
import { formattedRowType } from '@/app/business/services/view-model/indicators-value-view-model.service';
import { ChartTooltip } from './chart-tooltip';

type MultiLineChartProps = {
  data: formattedRowType[];
  categories: string[];
  noDataText?: string;
};

export default function MultiLineChart({ data, categories, noDataText }: MultiLineChartProps) {
  const [value, setValue] = useState<EventProps>(null);
  const index = 'date';

  const formatteedData = formmatData(data);
  return (
    <>
      <LineChart
        className="h-full"
        data={formatteedData}
        index={index}
        categories={categories}
        colors={['indigo-300', 'rose-200', 'neutral', 'indigo', 'blue']}
        yAxisWidth={30}
        onValueChange={(v) => setValue(v)}
        showAnimation={true}
        animationDuration={600}
        noDataText={noDataText}
        customTooltip={ChartTooltip}
      />
    </>
  );
}

function formmatData(data: formattedRowType[]) {
  return data.map((d) => {
    return {
      ...Object.keys(d).reduce((acc, key) => {
        if (key === 'date') {
          return { ...acc, [key]: d[key] };
        }
        return {
          ...acc,
          [key]: (
            d[key] as {
              value: number;
              displayValue: number;
            }
          ).value,
        };
      }, {}),
      displayValue: Object.keys(d).reduce((acc, key) => {
        if (key === 'date') {
          return { ...acc, [key]: d[key] };
        }
        return {
          ...acc,
          [key]: (
            d[key] as {
              value: number;
              displayValue: number;
            }
          ).displayValue,
        };
      }, {}),
    };
  });
}
