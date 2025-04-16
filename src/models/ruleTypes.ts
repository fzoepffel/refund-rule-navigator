
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
  'angebotsstaffel';

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
  'Egal' |
  'auto_return_full_refund' | 
  'discount_then_return' | 
  'discount_then_keep';

export interface PriceThreshold {
  minPrice: number;
  maxPrice?: number;
  value: number;
  valueType: ThresholdValueType;
}

export interface DiscountLevel {
  value: number;
  valueType: ThresholdValueType;
}

export interface DiscountRule {
  id: string;
  name: string;
  requestCategory: RequestCategory;
  requestType: RequestType;
  triggers: Trigger[];
  calculationBase: CalculationBase;
  roundingRule: RoundingRule;
  returnHandling: ReturnHandling;
  shippingType: ShippingType;
  returnStrategy: ReturnStrategy;
  value?: number;
  packageOpened?: 'yes' | 'no' | 'Egal';
  priceThresholds?: PriceThreshold[];
  discountLevels?: DiscountLevel[];
  checkIfProductOpened?: boolean;
  customerLoyaltyCheck?: boolean;
  minOrderAgeToDays?: number;
  requestPictures?: boolean;
  isCompleteRule?: boolean;
  consultPartnerBeforePayout?: boolean;
  offerDiscountBeforeReturn?: boolean;
  sendInfoToPartner?: boolean;
  noReturnOnFullRefund?: boolean;
  notes?: string;
  maxAmount?: number;
}
