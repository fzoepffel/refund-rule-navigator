
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
  'Keinen Grund angegeben' | 
  'Artikel beschädigt/funktioniert nicht mehr' | 
  'Versandverpackung und Artikel beschädigt' | 
  'Teile oder Zubehör fehlen' | 
  'Falscher Artikel' | 
  'Sonstiges';

export type CalculationBase = 
  'keine_berechnung' | 
  'prozent_vom_vk' | 
  'fester_betrag' | 
  'preisstaffel' |
  'angebotsstaffel'; // Added 'angebotsstaffel' as a valid type

export type RoundingRule = 
  'keine_rundung' | 
  'auf_5_euro' | 
  'auf_10_euro' | 
  'auf_10_cent';

export type ReturnHandling = 
  'automatisches_label' | 
  'manuelles_label' | 
  'zweitverwerter' | 
  'keine_retoure';

export type ThresholdValueType = 'percent' | 'fixed';

export type ShippingType = 'Egal' | 'paket' | 'spedition';

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
  roundingRule: RoundingRule  // Add individual rounding rule
}

// New interface to represent a single calculation stage
export interface CalculationStage {
  id: string,
  calculationBase: CalculationBase,
  value?: number,
  roundingRule: RoundingRule,
  priceThresholds?: PriceThreshold[]
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
  multiStageDiscount?: boolean,
  calculationStages?: CalculationStage[],
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
  sendInfoToPartner?: boolean
}
