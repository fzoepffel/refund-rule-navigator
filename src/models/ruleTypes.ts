
export type ReturnStrategy = 
  'auto_return_full_refund' | 
  'discount_then_return' | 
  'discount_then_keep';

// Adding the complete DiscountRule type definition
export interface DiscountRule {
  id: string;
  name: string;
  requestType: string;
  requestCategory: string;
  returnStrategy: ReturnStrategy;
  triggers: string[];
  calculationBase: string;
  value?: number;
  roundingRule: string;
  returnHandling: string;
  shippingType: string;
  priceThresholds?: {
    minPrice: number;
    maxPrice?: number;
    value: number;
    valueType: 'percent' | 'fixed';
  }[];
  discountLevels?: {
    value: number;
    valueType: 'percent' | 'fixed';
  }[];
  maxAmount?: number;
  checkIfProductOpened?: boolean;
  offerDiscountBeforeReturn?: boolean;
  requestPictures?: boolean;
  consultPartnerBeforePayout?: boolean;
  sendInfoToPartner?: boolean;
  noReturnOnFullRefund?: boolean;
  notes?: string;
}
