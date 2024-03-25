import { IndicatorValueItemResponse } from '@/app/store/querys/numerical-guidance/indicator.query';

export type FormattedItem = {
  [date: string]: {
    [ticker: string]: FormattedIndicatorValue;
  };
};

export type FormattedIndicatorValue = {
  value: number;
  displayValue: number;
};

export type UnitType = 'index' | 'default';

export class IndicatorValueItem {
  readonly date: string;
  readonly value: number | string;
  constructor({ date, value }: IndicatorValueItemResponse) {
    this.date = date;
    this.value = value;
  }

  calcuateIndexValue(maxValue: number, minValue: number) {
    if (typeof this.value === 'number') {
      return ((this.value - minValue) / (maxValue - minValue)) * 100;
    } else {
      return ((parseInt(this.value) - minValue) / (maxValue - minValue)) * 100;
    }
  }

  get parseValueToInt() {
    return typeof this.value === 'number' ? this.value : parseInt(this.value);
  }
}

export abstract class IndicatorValue {
  abstract formattedItemsByDate({ unitType }: { unitType: UnitType }): FormattedItem;
}
