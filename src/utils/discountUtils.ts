
import { 
  Trigger, 
  RequestType, 
  CalculationBase, 
  RoundingRule, 
  ReturnHandling,
  ThresholdValueType,
  DiscountRule,
  PriceThreshold,
  CalculationStage,
  ReturnStrategy
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

export const getReturnStrategyLabel = (strategy: ReturnStrategy): string => {
  const labels: Record<ReturnStrategy, string> = {
    'auto_return_full_refund': 'Automatische Rückerstattung bei Retoure',
    'discount_then_return': 'Rabatt anbieten, dann Retoure',
    'discount_then_keep': 'Rabatt anbieten, Artikel behalten',
    'discount_then_contact_merchant': 'Rabatt anbieten, dann Merchant kontaktieren',
    'contact_merchant_immediately': 'Sofort Merchant kontaktieren'
  };
  return labels[strategy] || strategy;
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

  // If this is a multi-stage discount, we only calculate the first stage here
  // (for display purposes in the rule list)
  if (rule.multiStageDiscount && rule.calculationStages && rule.calculationStages.length > 0) {
    const firstStage = rule.calculationStages[0];
    return calculateDiscountForStage(salePrice, firstStage, rule);
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
          // Apply the threshold-specific rounding rule
          return applyRoundingRule(amount, applicableThreshold.roundingRule);
        }
      }
      break;
  }
  
  // Apply max amount limit if it exists
  if (rule.maxAmount && amount > rule.maxAmount) {
    amount = rule.maxAmount;
  }
  
  // Apply general rounding rule (for fixed amount or percentage calculations)
  return applyRoundingRule(amount, rule.roundingRule);
};

/**
 * Calculate discount for a specific stage
 */
export const calculateDiscountForStage = (
  salePrice: number, 
  stage: CalculationStage, 
  rule: DiscountRule
): number | string => {
  if (stage.calculationBase === 'keine_berechnung') {
    return 'Rücksprache mit Partner notwendig';
  }

  let amount = 0;
  
  switch (stage.calculationBase) {
    case 'fester_betrag':
      // For fixed amount, just use the value directly
      amount = stage.value || 0;
      break;
      
    case 'prozent_vom_vk':
      // For percentage, calculate based on sale price
      const percentage = stage.value || 0;
      amount = (salePrice * percentage) / 100;
      break;
      
    case 'preisstaffel':
      // For price thresholds, find the applicable threshold
      if (stage.priceThresholds && stage.priceThresholds.length > 0) {
        const applicableThreshold = stage.priceThresholds.find(
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
          // Apply the threshold-specific rounding rule
          return applyRoundingRule(amount, applicableThreshold.roundingRule);
        }
      }
      break;
  }
  
  // Apply max amount limit if it exists
  if (rule.maxAmount && amount > rule.maxAmount) {
    amount = rule.maxAmount;
  }
  
  // Apply stage-specific rounding rule
  return applyRoundingRule(amount, stage.roundingRule);
};

/**
 * Calculate discounts for all stages in a multi-stage discount
 */
export const calculateMultiStageDiscounts = (
  salePrice: number, 
  rule: DiscountRule
): (number | string)[] => {
  if (!rule.multiStageDiscount || !rule.calculationStages || rule.calculationStages.length === 0) {
    return [calculateDiscount(salePrice, rule)];
  }
  
  return rule.calculationStages.map(stage => calculateDiscountForStage(salePrice, stage, rule));
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

/**
 * This function is needed in RuleCalculator.tsx
 * It calculates discount for a specific calculation level
 */
export const calculateDiscountForLevel = (
  salePrice: number, 
  calculationStage: CalculationStage, 
  rule: DiscountRule
): number | string => {
  return calculateDiscountForStage(salePrice, calculationStage, rule);
};
