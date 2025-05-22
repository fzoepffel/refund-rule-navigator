export type Trigger = 
  | 'Geschmacksretoure'
  | 'Mangel'
  | 'Artikel beschädigt/funktioniert nicht mehr'
  | 'Versandverpackung und Artikel beschädigt'
  | 'Teile oder Zubehör fehlen'
  | 'Falscher Artikel';

export type CalculationBase = 
  'prozent_vom_vk' | 
  'fester_betrag' | 
  'preisstaffel' | 
  'angebotsstaffel';

export type RoundingRule = 
  'keine_rundung' | 
  'auf_5_euro' | 
  'auf_10_euro' | 
  'auf_1_euro';

export type ThresholdValueType = 'percent' | 'fixed';

export type ShippingType = 'Egal' | 'Paket' | 'Spedition';

export interface PriceThreshold {
  minPrice: number,
  maxPrice?: number,
  value: number,
  valueType: ThresholdValueType,
  roundingRule: RoundingRule,  // Add individual rounding rule
}

export interface DiscountLevel {
  value: number,
  valueType: ThresholdValueType,
  roundingRule: RoundingRule  // Add individual rounding rule
}

export interface CalculationStage {
  calculationBase: CalculationBase;
  value?: number;
  priceThresholds?: PriceThreshold[];
  roundingRule: RoundingRule;
  maxAmount?: number;
}

export interface DiscountRule {
  id: string,
  name: string,
  packageOpened?: 'yes' | 'no' | 'Egal',
  triggers: Trigger[],
  calculationBase: CalculationBase,
  value?: number,
  roundingRule: RoundingRule,
  shippingType: ShippingType,
  priceThresholds?: PriceThreshold[],
  discountLevels?: DiscountLevel[],
  maxAmount?: number,
  consultPartnerBeforePayout?: boolean,
  notes?: string,
  hasMultipleStages?: boolean,
  calculationStages?: CalculationStage[]
}
