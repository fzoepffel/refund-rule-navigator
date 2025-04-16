export type RequestType = 
  | 'Ersatzteil gewünscht'
  | 'Preisnachlass gewünscht'
  | 'Kontaktaufnahme gewünscht'
  | 'Artikel zurücksenden'
  | 'Rücksendung gewünscht';

export type Trigger = 
  | 'Artikel beschädigt/funktioniert nicht mehr'
  | 'Versandverpackung und Artikel beschädigt'
  | 'Teile oder Zubehör fehlen'
  | 'Falscher Artikel'
  | 'Sonstiges';

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

export type ReturnHandling = 
  | 'automatisches_label' 
  | 'manuelles_label' 
  | 'zweitverwerter' 
  | 'keine_retoure';

export type ThresholdValueType = 'percent' | 'fixed';

export type ShippingType = 'paket' | 'spedition';

export type ReturnStrategy = 
  | 'auto_return_full_refund'
  | 'discount_then_return'
  | 'discount_then_keep';

export interface PriceThreshold {
  minPrice: number;
  maxPrice?: number; // undefined means no upper limit
  value: number;     // percentage or fixed amount
  valueType: ThresholdValueType;
}

// Add a new interface for discount levels that can be either percent or fixed amount
export interface DiscountLevel {
  value: number;
  valueType: ThresholdValueType; 
}

export interface DiscountRule {
  id: string;
  name: string;
  requestType: RequestType;
  triggers: Trigger[];
  calculationBase: CalculationBase;
  roundingRule: RoundingRule;
  returnHandling: ReturnHandling;
  shippingType: ShippingType;
  returnStrategy?: ReturnStrategy;
  maxAmount?: number;
  
  // For percentage or fixed amount
  value?: number;
  
  // For price thresholds
  priceThresholds?: PriceThreshold[];
  
  // For discount ladder - changed from simple number array to DiscountLevel array
  discountLevels?: DiscountLevel[];
  
  // Special rules
  checkIfProductOpened?: boolean;
  offerDiscountBeforeReturn?: boolean;
  noReturnOnFullRefund?: boolean;
  customerLoyaltyCheck?: boolean;
  minOrderAgeToDays?: number;
  sendInfoToPartner?: boolean;
  
  // Additional actions
  requestPictures?: boolean;
  consultPartnerBeforePayout?: boolean;
  
  // Rule completeness check
  isCompleteRule?: boolean;
  
  // Additional notes
  notes?: string;
}
