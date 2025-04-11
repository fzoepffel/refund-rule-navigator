
import { 
  Trigger, 
  RequestType, 
  CalculationBase, 
  RoundingRule, 
  CostCenter, 
  ReturnHandling,
  ThresholdValueType,
  DiscountRule,
  PriceThreshold,
  DiscountLevel
} from "../models/ruleTypes";

export const getTriggerLabel = (trigger: Trigger): string => {
  return trigger; // The triggers are now readable labels themselves
};

export const getRequestTypeLabel = (type: RequestType): string => {
  return type; // The request types are now readable labels themselves
};

export const getCalculationBaseLabel = (base: CalculationBase): string => {
  const labels: Record<CalculationBase, string> = {
    'prozent_vom_vk': 'Prozent vom Verkaufspreis',
    'fester_betrag': 'Fester Betrag',
    'preisstaffel': 'Preisabhängige Staffelung',
    'angebotsstaffel': 'Mehrere Angebotsstufen',
    'keine_berechnung': 'Keine Berechnung'
  };
  return labels[base] || base;
};

export const getRoundingRuleLabel = (rule: RoundingRule): string => {
  const labels: Record<RoundingRule, string> = {
    'keine_rundung': 'Keine Rundung',
    'auf_5_euro': 'Auf 5€ aufrunden',
    'auf_10_euro': 'Auf 10€ aufrunden',
    'auf_10_cent': 'Auf 10 Cent aufrunden'
  };
  return labels[rule] || rule;
};

export const getCostCenterLabel = (center: CostCenter): string => {
  const labels: Record<CostCenter, string> = {
    'merchant': 'Händler',
    'check24': 'CHECK24'
  };
  return labels[center] || center;
};

export const getReturnHandlingLabel = (handling: ReturnHandling): string => {
  const labels: Record<ReturnHandling, string> = {
    'automatisches_label': 'Automatisches Retourenlabel',
    'manuelles_label': 'Manuelles Retourenlabel',
    'zweitverwerter': 'Zweitverwerter',
    'keine_retoure': 'Keine Retoure erforderlich'
  };
  return labels[handling] || handling;
};

export const getThresholdValueTypeLabel = (type: ThresholdValueType): string => {
  const labels: Record<ThresholdValueType, string> = {
    'percent': '%',
    'fixed': '€'
  };
  return labels[type] || type;
};

export const applyRoundingRule = (value: number, rule: RoundingRule): number => {
  switch (rule) {
    case 'keine_rundung':
      return value;
    case 'auf_5_euro':
      return Math.ceil(value / 5) * 5;
    case 'auf_10_euro':
      return Math.ceil(value / 10) * 10;
    case 'auf_10_cent':
      return Math.ceil(value * 10) / 10;
    default:
      return value;
  }
};

/**
 * Calculate discount amount based on the rule and sale price
 */
export const calculateDiscount = (salePrice: number, rule: DiscountRule): number | string => {
  if (rule.calculationBase === 'keine_berechnung') {
    return 'Rücksprache mit Partner notwendig';
  }

  let amount = 0;
  
  switch (rule.calculationBase) {
    case 'fester_betrag':
      // For fixed amount, just use the value directly
      amount = rule.value || 0;
      break;
      
    case 'prozent_vom_vk':
      // For percentage, calculate based on sale price
      const percentage = rule.value || 0;
      amount = (salePrice * percentage) / 100;
      break;
      
    case 'preisstaffel':
      // For price thresholds, find the applicable threshold
      if (rule.priceThresholds && rule.priceThresholds.length > 0) {
        const applicableThreshold = rule.priceThresholds.find(
          threshold => 
            salePrice >= threshold.minPrice && 
            (!threshold.maxPrice || salePrice <= threshold.maxPrice)
        );
        
        if (applicableThreshold) {
          if (applicableThreshold.valueType === 'percent') {
            amount = (salePrice * applicableThreshold.value) / 100;
          } else {
            amount = applicableThreshold.value;
          }
        }
      }
      break;
      
    case 'angebotsstaffel':
      // For discount levels, use the first level as a simple implementation
      if (rule.discountLevels && rule.discountLevels.length > 0) {
        const firstLevel = rule.discountLevels[0];
        
        if (firstLevel.valueType === 'percent') {
          amount = (salePrice * firstLevel.value) / 100;
        } else {
          // Fixed amount
          amount = firstLevel.value;
        }
      }
      break;
  }
  
  // Apply max amount limit if it exists
  if (rule.maxAmount && amount > rule.maxAmount) {
    amount = rule.maxAmount;
  }
  
  // Apply rounding rule
  return applyRoundingRule(amount, rule.roundingRule);
};

/**
 * Calculate discount for a specific level in a discount ladder
 */
export const calculateDiscountForLevel = (
  salePrice: number, 
  level: DiscountLevel, 
  rule: DiscountRule
): number => {
  let amount = 0;
  
  if (level.valueType === 'percent') {
    amount = (salePrice * level.value) / 100;
  } else {
    amount = level.value;
  }
  
  // Apply max amount limit if it exists
  if (rule.maxAmount && amount > rule.maxAmount) {
    amount = rule.maxAmount;
  }
  
  // Apply rounding rule
  return applyRoundingRule(amount, rule.roundingRule);
};

/**
 * Format a number as currency (EUR)
 */
export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') {
    return value;
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};
