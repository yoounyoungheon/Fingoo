import { useMemo } from 'react';
import { useFetchIndicatorsValue } from '../querys/numerical-guidance/indicator.query';
import { convertIndicatorsValueViewModel } from '../services/indicators-value-view-model.service';
import { useSelectedIndicatorBoardMetadata } from './use-selected-indicator-board-metadata.hook';

export const useIndicatorsValueViewModel = () => {
  const { selectedMetadata } = useSelectedIndicatorBoardMetadata();
  const { data: indicatorsValueData } = useFetchIndicatorsValue(selectedMetadata?.indicators ?? []);

  const indciatorsValueViewModel = useMemo(() => {
    if (!indicatorsValueData) return undefined;

    return convertIndicatorsValueViewModel(indicatorsValueData);
  }, [indicatorsValueData]);

  // 여기? 아니먄 컴포넌트?
  const formattedIndicatorsRows = useMemo(
    () => indciatorsValueViewModel?.formattedIndicatorsInRow,
    [indicatorsValueData],
  );

  return {
    indciatorsValueViewModel,
    formattedIndicatorsRows,
  };
};
