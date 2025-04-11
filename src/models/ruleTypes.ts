
export type RequestType = 
  | 'Ersatzteil gewünscht'
  | 'Preisnachlass gewünscht'
  | 'Kontaktaufnahme gewünscht'
  | 'Artikel zurücksenden';

export type Trigger = 
  | 'Artikel beschädigt/funktioniert nicht mehr'
  | 'Versandverpackung und Artikel beschädigt'
  | 'Teile oder Zubehör fehlen'
  | 'Falscher Artikel';

export type CalculationBase = 
  | 'prozent_vom_vk' 
  | 'fester_betrag' 
  | 'preisstaffel' 
  | 'angebotsstaffel'
  | 'keine_berechnung';

export type RoundingRule = 
  | 'keine_rundung' 
  | 'auf_5_euro' 
  | 'auf_10_euro' 
  | 'auf_10_cent';

export type CostCenter = 
  | 'merchant' 
  | 'check24';

export type ReturnHandling = 
  | 'automatisches_label' 
  | 'manuelles_label' 
  | 'zweitverwerter' 
  | 'keine_retoure';

export type ThresholdValueType = 'percent' | 'fixed';

export type ShippingType = 'paket' | 'spedition';

export interface PriceThreshold {
  minPrice: number;
  maxPrice?: number; // undefined means no upper limit
  value: number;     // percentage or fixed amount
  valueType: ThresholdValueType;
}

export interface DiscountRule {
  id: string;
  name: string;
  requestType: RequestType;
  triggers: Trigger[];
  calculationBase: CalculationBase;
  roundingRule: RoundingRule;
  costCenter: CostCenter;
  returnHandling: ReturnHandling;
  shippingType: ShippingType;
  maxAmount?: number;
  
  // For percentage or fixed amount
  value?: number;
  
  // For price thresholds
  priceThresholds?: PriceThreshold[];
  
  // For discount ladder
  discountLevels?: number[];
  
  // Special rules
  checkIfProductOpened?: boolean;
  offerDiscountBeforeReturn?: boolean;
  noReturnOnFullRefund?: boolean;
  minOrderAgeToDays?: number;
  customerLoyaltyCheck?: boolean;
  
  // Additional actions
  requestPictures?: boolean;
  consultPartnerBeforePayout?: boolean;
  sendInfoToPartner?: boolean;
  requestReceiptOrProofOfPurchase?: boolean;
  collectCustomerFeedback?: boolean;
  
  // Additional notes
  notes?: string;
}
