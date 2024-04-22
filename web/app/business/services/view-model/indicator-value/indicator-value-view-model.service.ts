import { IndicatorValueItemResponse } from '@/app/store/querys/numerical-guidance/indicator.query';
import { FormattedIndicatorValue } from '../../chart/indicator-formatter.service';

export type FormattedItem = {
  [date: string]: {
    [identiifer: string]: FormattedIndicatorValue;
  };
};

export type CaculatedItem = {
  date: string;
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
  public id: string;
  protected maxValue: number;
  protected minValue: number;

  constructor(id: string, maxValue: number, minValue: number) {
    this.id = id;
    this.maxValue = maxValue;
    this.minValue = minValue;
  }

  abstract formattedItemsValue({ unitType }: { unitType: UnitType }): CaculatedItem[];

  abstract formattedItemsByDate({ unitType }: { unitType: UnitType }): FormattedItem;

  abstract get identifier(): string;

  caculateValue(item: IndicatorValueItem, unitType: UnitType) {
    return unitType === 'index' ? item.calcuateIndexValue(this.maxValue, this.minValue) : item.parseValueToInt;
  }
}
