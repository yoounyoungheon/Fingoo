import { useMemo } from 'react';
import { LiveIndicatorRequestParams } from '../../../store/querys/numerical-guidance/indicator.query';
import { convertLiveIndicatorsValueViewModel } from '../../services/view-model/indicator-value/actual-indicators-value-view-model.service';
import { useIndicatorBoardMetadataViewModel } from '../indicator-board-metedata/use-indicator-board-metadata-view-model.hook';
import { useIndicatorBoard } from '../indicator-board/use-indicator-board.hook';
import { useIndicatorBoardMetadataStore } from '@/app/store/stores/numerical-guidance/indicator-board-metadata.store';
import { useFetchLiveIndicatorsValueByType } from '../../../store/querys/numerical-guidance/indicator.query';

export const useLiveIndicatorsValueViewModel = (indicatorBoardMetadataId?: string) => {
  const { indicatorBoardMetadata } = useIndicatorBoardMetadataViewModel(indicatorBoardMetadataId);
  const { interval } = useIndicatorBoard(indicatorBoardMetadataId);
  const indicatorsUnitType = useIndicatorBoardMetadataStore(
    (state) => state.indicatorsInMetadataUnitType[indicatorBoardMetadataId ?? ''],
  );

  const params: LiveIndicatorRequestParams = {
    indicatorType: 'forex_pairs',
    startDate: '2021-07-01',
    interval,
    ids: indicatorBoardMetadata?.indicatorIds,
  };
  const { data: indicatorsValueData, isLoading } = useFetchLiveIndicatorsValueByType(params);

  const convertedIndciatorsValue = useMemo(() => {
    if (!indicatorsValueData) return undefined;

    const convertedIndciatorsValue = convertLiveIndicatorsValueViewModel(indicatorsValueData);
    convertedIndciatorsValue.indicatorsValue.forEach((indicator) => {
      const unitType = indicatorsUnitType?.find((unit) => unit.indicatorId === indicator.indicatorId)?.unitType;
      indicator.unitType = unitType ?? 'default';
    });
    return convertedIndciatorsValue;
  }, [indicatorsValueData, indicatorsUnitType]);

  return {
    indicatorsValue: convertedIndciatorsValue,
    isPending: isLoading,
  };
};
