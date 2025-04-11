
export type Trigger = 
  | 'widerruf' 
  | 'reklamation' 
  | 'beschaedigte_ware' 
  | 'fehlende_teile' 
  | 'geschmackssache'
  | 'sonstiges';

export type CalculationBase = 
  | 'prozent_vom_vk' 
  | 'fester_betrag' 
  | 'preisstaffel' 
  | 'angebotsstaffel';

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

export interface PriceThreshold {
  minPrice: number;
  maxPrice?: number; // undefined means no upper limit
  value: number;     // percentage or fixed amount
}

export interface DiscountRule {
  id: string;
  name: string;
  triggers: Trigger[];
  calculationBase: CalculationBase;
  roundingRule: RoundingRule;
  costCenter: CostCenter;
  returnHandling: ReturnHandling;
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
  
  // Additional actions
  requestPictures?: boolean;
  consultPartnerBeforePayout?: boolean;
  sendInfoToPartner?: boolean;
  
  // Additional notes
  notes?: string;
}
