'use client';
import { Card } from '@tremor/react';
import IndicatorsChart from '../indicator/indicators-chart';
import IntervalToggleGroup from './interval-toggle-group';
import { SWRConfig } from 'swr';
import ClientDataSuspense from '../../util/client-data-suspense';
import CustomForecastIndicatorStabilityCallout from '../custom-forecast-indicator/custom-forecast-indicator-stability-callout';
import React from 'react';
import { useSelectedIndicatorBoardMetadata } from '@/app/business/hooks/numerical-guidance/indicator-board-metedata/use-selected-indicator-board-metadata-view-model.hook';
import { cn } from '@/app/utils/style';

type IndicatorBoardProps = {
  indicatorBoardMetadataId?: string;
};

const IndicatorBoard = React.memo(function IndicatorBoard({ indicatorBoardMetadataId }: IndicatorBoardProps) {
  const { selectedMetadataId, selectMetadataById } = useSelectedIndicatorBoardMetadata();

  const isSelected = indicatorBoardMetadataId ? selectedMetadataId === indicatorBoardMetadataId : false;

  const handleMetadataSelect = () => {
    if (indicatorBoardMetadataId) {
      selectMetadataById(indicatorBoardMetadataId);
    }
  };

  return (
    <Card
      onDoubleClick={handleMetadataSelect}
      className={cn('min-h-[32.5rem] w-full rounded-lg bg-white', {
        'border-4 border-fingoo-main': isSelected,
      })}
    >
      <ClientDataSuspense fallback={<div>loading...</div>}>
        <SWRConfig value={{ suspense: true, keepPreviousData: true }}>
          <IndicatorsChart indicatorBoardMetadataId={indicatorBoardMetadataId} />
          <div className="py-6">
            <IntervalToggleGroup indicatorBoardMetadataId={indicatorBoardMetadataId} />
          </div>
          <CustomForecastIndicatorStabilityCallout indicatorBoardMetadataId={indicatorBoardMetadataId} />
        </SWRConfig>
      </ClientDataSuspense>
    </Card>
  );
});

export default IndicatorBoard;
