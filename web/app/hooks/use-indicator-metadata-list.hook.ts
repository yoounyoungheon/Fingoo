import { useStore } from '../store';

import { useCreateIndicatorMetadata } from '../api/command/numerical-guidance.command';
import { useFetchIndicatorMetadataList } from '../api/query/numerical-guidance.query';
import { IndicatorBoardMetadata } from '../store/indicator-board-metadata.slice';

export const useIndicatorMetadataList = () => {
  const { metadataList, error, isLoading } = useFetchIndicatorMetadataList();
  const { trigger } = useCreateIndicatorMetadata();
  const selectMetaData = useStore((state) => state.selectMetaData);

  const createAndSelectMetadata = async (metadata: IndicatorBoardMetadata) => {
    try {
      await trigger(metadata, {
        optimisticData: () => {
          selectMetaData(metadata.id);
          return {
            metadataList: [...(metadataList || []), metadata],
          };
        },
        revalidate: false,
      });
    } catch (e) {
      selectMetaData(null);
    }
  };

  return {
    metadataList,
    error,
    isLoading,
    createAndSelectMetadata,
  };
};
