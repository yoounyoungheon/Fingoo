import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRProviderWithoutCache } from '@/app/ui/components/util/swr-provider';
import { mockDB, resetMockDB } from '@/app/mocks/db';
import { resetAllStore } from '@/app/store/stores/reset-store';
import { useSelectedCustomForecastIndicatorViewModel } from '@/app/business/hooks/numerical-guidance/custom-forecast-indicator/use-selected-custom-forecast-indicator-view-model';
import { createIndicator } from '@/app/business/services/numerical-guidance/view-model/indicator-list/indicator-view-model.service';

const wrapper = SWRProviderWithoutCache;

describe('useSelectedCustomForecastIndicatorViewModel', () => {
  beforeEach(() => {
    resetAllStore();
    resetMockDB();
  });

  it('예측 지표를 선택하지 않을 때, 선택한 예측 지표를 가져오지 않는다', async () => {
    // given
    const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

    // when
    // then
    expect(result.current.selectedCustomForecastIndicator).toBeUndefined();
  });

  it('예측 지표를 선택하면, 선택한 예측 지표를 가져온다', async () => {
    // given
    const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

    // when
    act(() => {
      result.current.selectCustomForecastIndicatorById('12');
    });
    await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());

    // then
    expect(result.current.selectedCustomForecastIndicator?.id).toBe('12');
  });

  it('예측 지표를 선택하면 선택한 예측 지표의 재료 지표 리스트를 가져온다', async () => {
    // given
    const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

    // when
    act(() => {
      result.current.selectCustomForecastIndicatorById('12');
    });
    await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());

    // then
    expect(result.current.selectedCustomForecastIndicator?.sourceIndicators).toHaveLength(2);
    expect(result.current.selectedCustomForecastIndicator?.sourceIndicators[0].symbol).toBe('AAPL');
    expect(result.current.selectedCustomForecastIndicator?.sourceIndicators[1].symbol).toBe('GOOG');
  });

  it('예측 지표 이름을 변경하면, 변경된 이름이 적용된다', async () => {
    // given
    const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

    // when
    act(() => {
      result.current.selectCustomForecastIndicatorById('12');
    });
    await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());
    act(() => {
      result.current.updateCustomForecastIndicatorName('테스트');
    });

    // then
    await waitFor(() => expect(result.current.selectedCustomForecastIndicator?.name).toBe('테스트'));
  });

  describe('sourceIndicator', () => {
    it('재료 지표를 추가하면, 재료 지표 리스트에 추가된다', async () => {
      // given
      const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

      // when
      act(() => {
        result.current.selectCustomForecastIndicatorById('11');
      });
      await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());
      act(() => {
        result.current.addSourceIndicator(createIndicator(mockDB.getIndicator('2')!));
      });

      // then
      expect(result.current.selectedCustomForecastIndicator?.sourceIndicators).toHaveLength(2);
      expect(result.current.selectedCustomForecastIndicator?.sourceIndicators[0].symbol).toBe('GOOG');
      expect(result.current.selectedCustomForecastIndicator?.sourceIndicators[1].symbol).toBe('MSFT');
    });

    it('재료 지표를 삭제하면, 재료 지표 리스트에서 삭제된다', async () => {
      // given
      const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

      // when
      act(() => {
        result.current.selectCustomForecastIndicatorById('12');
      });
      await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());
      act(() => {
        result.current.deleteSourceIndicator('1');
      });

      // then
      expect(result.current.selectedCustomForecastIndicator?.sourceIndicators).toHaveLength(1);
    });

    it('재료 지표의 가중치를 변경하면, 재료 지표 리스트의 가중치가 변경된다', async () => {
      // given
      const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

      // when
      act(() => {
        result.current.selectCustomForecastIndicatorById('11');
      });
      await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());
      act(() => {
        result.current.updateSourceIndicatorWeight('3', 50);
      });

      // then
      expect(result.current.sourceIndicatorList?.[0].weight).toBe(50);
    });

    it('재료 지표 변경내용을 적용하면, 변경된 내용이 적용된다', async () => {
      // given
      const { result } = renderHook(() => useSelectedCustomForecastIndicatorViewModel(), { wrapper });

      // when
      act(() => {
        result.current.selectCustomForecastIndicatorById('11');
      });
      await waitFor(() => expect(result.current.selectedCustomForecastIndicator).not.toBeUndefined());
      act(() => {
        result.current.updateSourceIndicatorWeight('3', 50);
      });
      expect(result.current.isUpdated).toBe(true);
      act(() => {
        result.current.applyUpdatedSourceIndicator();
      });

      // then
      await waitFor(() => expect(result.current.isUpdated).toBe(false));
    });
  });
});
