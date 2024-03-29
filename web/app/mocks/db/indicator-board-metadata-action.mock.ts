import {
  IndicatorBoardMetadataResponse,
  CreateIndicatorMetadataRequestBody,
  AddIndicatorToMetadataRequestBody,
  UpdateIndicatorBoardMetadataRequestBody,
  AddCustomForecastIndicatorToMetadataRequestBody,
  CreateIndicatorMetadataResponse,
} from '@/app/store/querys/numerical-guidance/indicator-board-metadata.query';
import { mockDatabaseStore } from '.';

export type MockIndicatorBoardMetadataAction = {
  getMetadataList: () => IndicatorBoardMetadataResponse[];
  postMetadataList: (newMetadata: CreateIndicatorMetadataRequestBody) => CreateIndicatorMetadataResponse;
  getMetadata: (id: string) => IndicatorBoardMetadataResponse | undefined;
  postIndicatorToMetadata: (id: string, data: AddIndicatorToMetadataRequestBody) => void;
  deleteIndicatorFromMetadata: (id: string, indicatorId: string) => void;
  patchMetadata: (id: string, data: UpdateIndicatorBoardMetadataRequestBody) => void;
  deleteIndicatorBoardMetadata: (id: string) => void;
  postCustomForecastIndicatorToMetadata: (id: string, data: AddCustomForecastIndicatorToMetadataRequestBody) => void;
  deleteCustomForecastIndicatorFromMetadata: (id: string, customForecastIndicatorId: string) => void;
};

export const mockIndicatorBoardMetadataAction: MockIndicatorBoardMetadataAction = {
  getMetadataList: () => {
    return mockDatabaseStore.metadataList;
  },
  postMetadataList: (data) => {
    const id = Math.random().toString(36);
    const newMetadata = {
      ...data,
      id,
      indicatorIds: [],
      customForecastIndicatorIds: [],
      indicatorIdsWithSessionIds: {
        session1: [],
      },
    };
    mockDatabaseStore.metadataList = [...mockDatabaseStore.metadataList, newMetadata];
    return id;
  },
  getMetadata: (id) => {
    return mockDatabaseStore.metadataList.find((metadata) => metadata.id === id);
  },
  postIndicatorToMetadata: (id, data) => {
    const index = mockDatabaseStore.metadataList.findIndex((metadata) => metadata.id === id);
    const lastSessionId = Object.keys(mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds).length;
    const newMetadata = {
      ...mockDatabaseStore.metadataList[index],
      indicatorIds: [...mockDatabaseStore.metadataList[index].indicatorIds, data.indicatorId],
      indicatorIdsWithSessionIds: {
        ...mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds,
        [`session${lastSessionId}`]: [
          ...mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds[`session${lastSessionId}`],
          data.indicatorId,
        ],
      },
    };

    mockDatabaseStore.metadataList[index] = newMetadata;
  },
  deleteIndicatorFromMetadata: (id, indicatorId) => {
    const index = mockDatabaseStore.metadataList.findIndex((metadata) => metadata.id === id);
    const newMetadata = {
      ...mockDatabaseStore.metadataList[index],
      indicatorIds: mockDatabaseStore.metadataList[index].indicatorIds.filter((id) => id !== indicatorId),
      indicatorIdsWithSessionIds: Object.entries(
        mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds,
      ).reduce<{
        [key: string]: string[];
      }>((acc, [key, value]) => {
        acc[key] = value.filter((id) => id !== indicatorId);
        return acc;
      }, {}),
    };

    mockDatabaseStore.metadataList[index] = newMetadata;
  },
  patchMetadata: (id, data) => {
    const index = mockDatabaseStore.metadataList.findIndex((metadata) => metadata.id === id);
    const newMetadata = {
      ...mockDatabaseStore.metadataList[index],
      ...data,
    };

    mockDatabaseStore.metadataList[index] = newMetadata;
  },
  deleteIndicatorBoardMetadata: (id) => {
    mockDatabaseStore.metadataList = mockDatabaseStore.metadataList.filter((metadata) => metadata.id !== id);
  },
  postCustomForecastIndicatorToMetadata: (id, data) => {
    const index = mockDatabaseStore.metadataList.findIndex((metadata) => metadata.id === id);
    const lastSessionId = Object.keys(mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds).length;
    const newMetadata = {
      ...mockDatabaseStore.metadataList[index],
      customForecastIndicatorIds: [
        ...mockDatabaseStore.metadataList[index].customForecastIndicatorIds,
        data.customForecastIndicatorId,
      ],
      indicatorIdsWithSessionIds: {
        ...mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds,
        [`session${lastSessionId}`]: [
          ...mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds[`session${lastSessionId}`],
          data.customForecastIndicatorId,
        ],
      },
    };

    mockDatabaseStore.metadataList[index] = newMetadata;
  },
  deleteCustomForecastIndicatorFromMetadata: (id, customForecastIndicatorId) => {
    const index = mockDatabaseStore.metadataList.findIndex((metadata) => metadata.id === id);
    const newMetadata = {
      ...mockDatabaseStore.metadataList[index],
      customForecastIndicatorIds: mockDatabaseStore.metadataList[index].customForecastIndicatorIds.filter(
        (id) => id !== customForecastIndicatorId,
      ),
      indicatorIdsWithSessionIds: Object.entries(
        mockDatabaseStore.metadataList[index].indicatorIdsWithSessionIds,
      ).reduce<{
        [key: string]: string[];
      }>((acc, [key, value]) => {
        acc[key] = value.filter((id) => id !== customForecastIndicatorId);
        return acc;
      }, {}),
    };

    mockDatabaseStore.metadataList[index] = newMetadata;
  },
};
