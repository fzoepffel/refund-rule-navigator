export type RequestCategory = 'Geschmacksretoure' | 'Mangel';

export type RequestType = 
  'Egal' | 
  'Ersatzteil gewünscht' | 
  'Preisnachlass gewünscht' | 
  'Kontaktaufnahme gewünscht' | 
  'Artikel zurücksenden' | 
  'Rücksendung gewünscht';

export type Trigger = 
  | 'Geschmacksretoure'
  | 'Mangel'
  | 'Artikel beschädigt/funktioniert nicht mehr'
  | 'Versandverpackung und Artikel beschädigt'
  | 'Teile oder Zubehör fehlen'
  | 'Falscher Artikel';

export type CalculationBase = 
  'keine_berechnung' | 
  'prozent_vom_vk' | 
  'fester_betrag' | 
  'preisstaffel' | 
  'angebotsstaffel';

export type RoundingRule = 
  'keine_rundung' | 
  'auf_5_euro' | 
  'auf_10_euro' | 
  'auf_1_euro';

export type ReturnHandling = 
  'automatisches_label' | 
  'manuelles_label' | 
  'zweitverwerter' | 
  'keine_retoure';

export type ThresholdValueType = 'percent' | 'fixed';

export type ShippingType = 'Egal' | 'Paket' | 'Spedition';

export type CustomerOption = 'Preisnachlass' | 'Umtausch' | 'Ersatzteil' | 'Rücksendung';

export interface PriceThreshold {
  minPrice: number,
  maxPrice?: number,
  value: number,
  valueType: ThresholdValueType,
  roundingRule: RoundingRule,  // Add individual rounding rule
  consultPartnerBeforePayout?: boolean
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
  requestType: RequestType,
  requestCategory?: RequestCategory[],  // Make it optional and an array
  packageOpened?: 'yes' | 'no' | 'Egal',
  triggers: Trigger[],
  calculationBase: CalculationBase,
  customerOptions: CustomerOption[],
  value?: number,
  roundingRule: RoundingRule,
  returnHandling: ReturnHandling,
  shippingType: ShippingType,
  priceThresholds?: PriceThreshold[],
  discountLevels?: DiscountLevel[],
  requestPictures?: boolean,
  previousRefundsCheck?: boolean,
  customerLoyaltyCheck?: boolean,
  minOrderAgeToDays?: number,
  maxAmount?: number,
  consultPartnerBeforePayout?: boolean,
  isCompleteRule?: boolean,
  notes?: string,
  noReturnOnFullRefund?: boolean,
  offerDiscountBeforeReturn?: boolean,
  sendInfoToPartner?: boolean,
  hasMultipleStages?: boolean,
  calculationStages?: CalculationStage[]
}
