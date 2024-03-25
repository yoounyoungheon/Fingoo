import { useLiveIndicatorsValueViewModel } from '@/app/business/hooks/indicator/use-live-indicators-value-view-model.hook';
import MultiLineChart from '../../view/molocule/multi-line-chart/multi-line-chart';
import { useSelectedIndicatorBoardMetadata } from '@/app/business/hooks/indicator-board-metedata/use-selected-indicator-board-metadata-view-model.hook';
import { useCustomForecastIndicatorsValueViewModel } from '@/app/business/hooks/custom-forecast-indicator/use-custom-forecast-indicators-value-view-model.hook';
import { IndicatorFormatter } from '@/app/business/services/chart/indicator-formatter.service';

export default function SimpleIndicatorsChart() {
  const { selectedMetadata } = useSelectedIndicatorBoardMetadata();
  const { indicatorsValue } = useLiveIndicatorsValueViewModel();
  // const { customForecastTargetIndicatorsValue } = useCustomForecastIndicatorsValueViewModel();
  const category = indicatorsValue?.tickerList ? indicatorsValue.tickerList : [];

  const indicatorFormatter = new IndicatorFormatter(indicatorsValue?.indicatorsValue ?? []);

  const formattedIndicatorsRows = indicatorFormatter.formattedIndicatorsInRow;
  return (
    <MultiLineChart
      data={formattedIndicatorsRows || []}
      categories={category}
      noDataText={selectedMetadata ? '선택한 지표가 없습니다. 지표를 선택해주세요' : '메타데이터를 선택해주세요'}
    />
  );
}
