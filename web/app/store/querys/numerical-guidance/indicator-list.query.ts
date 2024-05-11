import useSWRImmutable from 'swr/immutable';

import { API_PATH } from '../api-path';
import { defaultFetcher } from '../fetcher';
import useSWRInfinite from 'swr/infinite';
import { IndicatorType } from '../../stores/numerical-guidance/indicator-list.store';

export type IndicatorInfoResponse = {
  id: string;
  ticker: string;
  name: string;
};

export type StocksIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'stocks';
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  mic_code: string;
  type: string;
};

export type ForexPairsIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'forex_pairs';
  symbol: string;
  currency_group: string;
  currency_base: string;
  currency_quote: string;
};

export type CryptocurrenciesIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'cryptocurrencies';
  symbol: string;
  available_exchanges: string[];
  currency_base: string;
  currency_quote: string;
};

export type EtfIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'etf';
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
};

export type IndicesIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'indices';
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  mic_code: string;
};

export type FundsIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'funds';
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  type: string;
};

export type BondsIndicatorResponse = {
  id: string;
  index: number;
  indicatorType: 'bonds';
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  type: string;
};

type PaginationMeta = {
  total: number;
  hasNextData: boolean;
  cursor: number;
};

export type indicatorByTypeResponse =
  | StocksIndicatorResponse
  | ForexPairsIndicatorResponse
  | CryptocurrenciesIndicatorResponse
  | EtfIndicatorResponse
  | IndicesIndicatorResponse
  | FundsIndicatorResponse
  | BondsIndicatorResponse;

export type IndicatorListResponse = {
  data: indicatorByTypeResponse[];
  meta: PaginationMeta;
};

export const useFetchIndicatorListByType = (indicatorType: IndicatorType) => {
  const getKey = (pageIndex: number, previousPageData: IndicatorListResponse) => {
    // 끝에 도달
    if (previousPageData && !previousPageData.meta.hasNextData) return null;

    // 첫 페이지, `previousPageData`가 없음
    if (pageIndex === 0) return `${API_PATH.indicatorList}/list?type=${indicatorType}&cursorToken=1`;

    // API의 엔드포인트에 커서를 추가
    return `${API_PATH.indicatorList}/list?type=${indicatorType}&cursorToken=${previousPageData.meta.cursor}`;
  };

  return useSWRInfinite<IndicatorListResponse>(getKey, defaultFetcher);
};

export const useFetchIndicatorList = () =>
  useSWRImmutable<IndicatorInfoResponse[]>(API_PATH.indicatorList, defaultFetcher);

export const useFetchSearchedIndicatorList = (search: string, indicatorType: IndicatorType) => {
  return useSWRImmutable<IndicatorInfoResponse[]>(
    `${API_PATH.indicatorList}/search?symbol=${search}&type=${indicatorType}`,
    defaultFetcher,
  );
};
