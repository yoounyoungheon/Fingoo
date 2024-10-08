import { useLogger } from '@/app/logging/use-logger.hook';
import { addIndicatorsToMetadata, getIndicatorValue } from '../../../services/linguistic-guidance/indicator.service';
import { getIndicatorBySymbolAPIFirst } from '../../../services/linguistic-guidance/search-symbol.service';
import { createIndicator } from '../../../services/numerical-guidance/view-model/indicator-list/indicator-view-model.service';
import { Indicator } from '../../../services/numerical-guidance/view-model/indicator-list/indicators/indicator.service';
import { useIndicatorBoardMetadataList } from '../../numerical-guidance/indicator-board-metedata/use-indicator-board-metadata-list-view-model.hook';
import { useSelectedIndicatorBoardMetadata } from '../../numerical-guidance/indicator-board-metedata/use-selected-indicator-board-metadata-view-model.hook';
import { useSplitIndicatorBoard } from '../../numerical-guidance/indicator-board/use-split-indicator-board.hook';

export default function useAnalyzeEconomy() {
  const {
    metadataList,
    createIndicatorBoardMetadata: createMetadata,
    revalidateIndicatorBoardMetadataList,
  } = useIndicatorBoardMetadataList();
  const { selectMetadataById } = useSelectedIndicatorBoardMetadata();
  const { addMetadataToIndicatorBoard } = useSplitIndicatorBoard();
  const logger = useLogger();

  const displayIndicatorBoardMetadata = (metadataId: string) => {
    const isSuccess = addMetadataToIndicatorBoard(metadataId);

    if (isSuccess) {
      selectMetadataById(metadataId);
    }
  };

  const createIndicatorBoardMetadata = async (title: string) => {
    const id = await createMetadata(title);
    logger.track('GPT_create_metadata', { metadata_item_count: metadataList?.length ?? -1 });

    return id;
  };

  const analyzeEconomicHandler = async (symbols: string[]) => {
    // 1. 심볼로 아이디 가져오기
    const indicators = (
      await Promise.all(
        symbols.map(async (symbol) => {
          const indicator = await getIndicatorBySymbolAPIFirst(symbol);

          if (!indicator) return;

          return createIndicator(indicator);
        }),
      )
    ).filter((indicator) => indicator !== undefined) as Indicator[];
    // 2. 메타데이터 만들기
    const metadataId = await createIndicatorBoardMetadata('Fingoo가 분석한 지표들');

    // 3. 메타데이터에 지표 추가
    await addIndicatorsToMetadata(metadataId, indicators);
    await revalidateIndicatorBoardMetadataList();

    // 4. 값 가져오기
    const indicatorsValue = await Promise.all(
      indicators.map(async (indicator) => {
        return await getIndicatorValue(indicator);
      }),
    );

    // 5. 메타데이터 선택
    displayIndicatorBoardMetadata(metadataId);

    // 6. GPT에 분석 요청
    return `
    분석한 지표들: ${JSON.stringify(symbols)}

    분석 지표들 값: ${JSON.stringify(
      indicatorsValue.map((indicatorValue) => {
        return {
          symbol: indicatorValue.symbol,
          value: indicatorValue.values.slice(
            Math.max(indicatorValue.values.length - 30, 0),
            indicatorValue.values.length - 1,
          ),
        };
      }),
    )}

    - 반드시 분석한 지표에 대한 이름과 심볼명을 밝혀야합니다.
    - 분석한 지표들을 바탕으로 종합적인 시장 추세를 설명해야합니다.
    `;
  };

  return {
    analyzeEconomicHandler,
  };
}
