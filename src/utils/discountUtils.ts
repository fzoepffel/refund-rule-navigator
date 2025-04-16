
import { ReturnStrategy } from '../models/ruleTypes';

export const getReturnStrategyLabel = (strategy: ReturnStrategy): string => {
  const labels: Record<ReturnStrategy, string> = {
    'auto_return_full_refund': 'Automatische Rückerstattung bei Retoure',
    'discount_then_return': 'Rabatt anbieten, dann Retoure',
    'discount_then_keep': 'Rabatt anbieten, Artikel behalten'
  };
  return labels[strategy];
};

// Add the missing exported functions
export const getTriggerLabel = (trigger: string): string => {
  return trigger; // Since triggers are already in human-readable format
};

export const getCalculationBaseLabel = (calculationBase: string): string => {
  const labels: Record<string, string> = {
    'fester_betrag': 'Fester Betrag',
    'prozent_vom_vk': 'Prozent vom Verkaufspreis',
    'preisstaffel': 'Preisstaffelung',
    'angebotsstaffel': 'Angebotsstaffelung'
  };
  return labels[calculationBase] || calculationBase;
};

export const getRoundingRuleLabel = (roundingRule: string): string => {
  const labels: Record<string, string> = {
    'keine_rundung': 'Keine Rundung',
    'auf_ganze_euro': 'Auf ganze Euro',
    'auf_5_euro': 'Auf 5 Euro',
    'auf_10_euro': 'Auf 10 Euro',
    'auf_halbe_euro': 'Auf halbe Euro'
  };
  return labels[roundingRule] || roundingRule;
};

export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') return value;
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(value);
};

export const calculateDiscountForLevel = (
  salePrice: number, 
  level: { value: number; valueType: 'percent' | 'fixed' },
  rule: any // Using any here since we don't have the full type definition
): number => {
  let amount = 0;
  
  if (level.valueType === 'percent') {
    amount = salePrice * (level.value / 100);
  } else {
    amount = level.value;
  }
  
  // Apply rounding rules if applicable
  amount = applyRoundingRule(amount, rule.roundingRule);
  
  // Apply max amount cap if present
  if (rule.maxAmount && amount > rule.maxAmount) {
    amount = rule.maxAmount;
  }
  
  return amount;
};

// Helper function to apply rounding rules
const applyRoundingRule = (amount: number, roundingRule: string): number => {
  switch(roundingRule) {
    case 'auf_ganze_euro':
      return Math.round(amount);
    case 'auf_5_euro':
      return Math.round(amount / 5) * 5;
    case 'auf_10_euro':
      return Math.round(amount / 10) * 10;
    case 'auf_halbe_euro':
      return Math.round(amount * 2) / 2;
    case 'keine_rundung':
    default:
      return amount;
  }
};

export const calculateDiscount = (salePrice: number, rule: any): number | string => {
  if (!rule || salePrice <= 0) {
    return "Ungültige Eingabe";
  }
  
  let discountAmount = 0;
  
  try {
    switch(rule.calculationBase) {
      case 'fester_betrag':
        discountAmount = rule.value || 0;
        break;
        
      case 'prozent_vom_vk':
        discountAmount = salePrice * ((rule.value || 0) / 100);
        break;
        
      case 'preisstaffel':
        if (!rule.priceThresholds || rule.priceThresholds.length === 0) {
          return "Keine Preisstaffel definiert";
        }
        
        // Find the applicable threshold
        let applicableThreshold = rule.priceThresholds.find((threshold: any) => 
          salePrice >= threshold.minPrice && 
          (!threshold.maxPrice || salePrice <= threshold.maxPrice)
        );
        
        if (!applicableThreshold) {
          // Default to the highest threshold if none matches
          applicableThreshold = rule.priceThresholds[rule.priceThresholds.length - 1];
        }
        
        if (applicableThreshold.valueType === 'percent') {
          discountAmount = salePrice * (applicableThreshold.value / 100);
        } else {
          discountAmount = applicableThreshold.value;
        }
        break;
        
      case 'angebotsstaffel':
        if (!rule.discountLevels || rule.discountLevels.length === 0) {
          return "Keine Angebotsstaffel definiert";
        }
        
        // Use the first level initially
        const firstLevel = rule.discountLevels[0];
        if (firstLevel.valueType === 'percent') {
          discountAmount = salePrice * (firstLevel.value / 100);
        } else {
          discountAmount = firstLevel.value;
        }
        break;
        
      default:
        return "Unbekannte Berechnungsgrundlage";
    }
    
    // Apply rounding rules
    discountAmount = applyRoundingRule(discountAmount, rule.roundingRule);
    
    // Apply max amount cap if present
    if (rule.maxAmount && discountAmount > rule.maxAmount) {
      discountAmount = rule.maxAmount;
    }
    
    return discountAmount;
  } catch (error) {
    console.error("Error calculating discount:", error);
    return "Fehler bei der Berechnung";
  }
};

