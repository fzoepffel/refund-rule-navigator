export type RequestCategory = 'Egal' | 'Widerruf' | 'Reklamation';

export type RequestType = 
  'Egal' | 
  'Ersatzteil gewünscht' | 
  'Preisnachlass gewünscht' | 
  'Kontaktaufnahme gewünscht' | 
  'Artikel zurücksenden' | 
  'Rücksendung gewünscht';

export type Trigger = 
  'Egal' | 
  'Leistung oder Qualität ungenügend' | 
  'Inkompatibel oder für den vorgesehenen Einsatz ungeeignet' | 
  'Gefällt mir nicht mehr' | 
  'Irrtümlich bestellt' | 
  'Günstigeren Preis entdeckt' | 
  'Artikel beschädigt/funktioniert nicht mehr' | 
  'Versandverpackung und Artikel beschädigt' | 
  'Teile oder Zubehör fehlen' | 
  'Falscher Artikel';

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

export type ReturnStrategy = 
  'auto_return_full_refund' | 
  'discount_then_return' | 
  'discount_then_keep' |
  'discount_then_contact_merchant' |
  'contact_merchant_immediately';

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
  requestCategory: RequestCategory,
  requestType: RequestType,
  packageOpened?: 'yes' | 'no' | 'Egal',
  triggers: Trigger[],
  calculationBase: CalculationBase,
  returnStrategy?: ReturnStrategy,
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
