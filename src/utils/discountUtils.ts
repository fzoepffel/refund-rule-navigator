import { 
  Trigger, 
  CalculationBase, 
  RoundingRule, 
  ThresholdValueType,
  DiscountRule,
  PriceThreshold,
  DiscountLevel
} from "../models/ruleTypes";

export const getTriggerLabel = (trigger: Trigger): string => {
  return trigger; // The triggers are now readable labels themselves
};

export const getCalculationBaseLabel = (base: CalculationBase): string => {
  const labels: Record<CalculationBase, string> = {
    'prozent_vom_vk': 'Prozent vom Verkaufspreis',
    'fester_betrag': 'Fester Betrag',
    'preisstaffel': 'Preisabhängige Staffelung',
    'angebotsstaffel': 'Mehrere Angebotsstufen'
  };
  return labels[base] || base;
};

export const getRoundingRuleLabel = (rule: RoundingRule): string => {
  switch (rule) {
    case 'keine_rundung':
      return 'keine Rundung';
    case 'auf_5_euro':
      return 'auf 5€ aufrunden';
    case 'auf_10_euro':
      return 'auf 10€ aufrunden';
    case 'auf_1_euro':
      return 'auf 1€ aufrunden';
    default:
      return rule;
  }
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
    case 'auf_1_euro':
      return Math.ceil(value);
    default:
      return value;
  }
};

/**
 * Calculate discount amount based on the rule and sale price
 */
export const calculateDiscount = (salePrice: number, rule: DiscountRule): number | string => {

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
        // Apply the level-specific rounding rule
        return applyRoundingRule(amount, firstLevel.roundingRule);
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
  
  // Apply level-specific rounding rule
  return applyRoundingRule(amount, level.roundingRule);
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

export const getTriggerLabels = (triggers: Trigger[]): string => {
  const mangelTriggers: Trigger[] = [
    'Artikel beschädigt/funktioniert nicht mehr',
    'Versandverpackung und Artikel beschädigt',
    'Teile oder Zubehör fehlen',
    'Falscher Artikel'
  ];

  // Check if all Mangel triggers are selected
  const allMangelTriggersSelected = mangelTriggers.every(trigger => triggers.includes(trigger));
  
  // If all Mangel triggers are selected, only show "Mangel"
  if (allMangelTriggersSelected) {
    return triggers
      .filter(trigger => !mangelTriggers.includes(trigger))
      .concat(['Mangel'])
      .map(getTriggerLabel)
      .join(", ");
  }
  
  // Otherwise, show only the specific triggers that are selected
  return triggers
    .filter(trigger => trigger !== 'Mangel') // Remove "Mangel" if it exists
    .map(getTriggerLabel)
    .join(", ");
};


  // Generate rule name according to new schema
  export const generateRuleName = (rule: DiscountRule) => {
    
    const parts: string[] = [];
    // Part 1: Main triggers (Geschmacksretoure/Mangel)
    const mainTriggers = ['Geschmacksretoure', 'Mangel'];
    const mangelTriggers = ['Artikel beschädigt/funktioniert nicht mehr', 'Versandverpackung und Artikel beschädigt', 'Teile oder Zubehör fehlen', 'Falscher Artikel'];
    
    const mainSelectedTriggers = rule.triggers.filter(t => mainTriggers.includes(t));
    // Check if all Mangel triggers are selected
    const allMangelTriggersSelected = mangelTriggers.every(trigger => rule.triggers.includes(trigger as Trigger));
    // If all Mangel triggers are selected, show "Mangel" instead of individual triggers
    if (allMangelTriggersSelected) {
      const triggersWithoutMangel = mainSelectedTriggers.filter(t => t !== 'Mangel');
      if (triggersWithoutMangel.length > 0) {
        parts.push(triggersWithoutMangel.join(", "));
      }
      parts.push("Mangel");
    } else {
      // Otherwise, show only the specific triggers that are selected
      const specificTriggers = rule.triggers.filter(t => t !== 'Mangel');
      if (specificTriggers.length > 0) {
        parts.push(specificTriggers.join(", "));
      }
    }

    // Part 2: Versandart
    if (rule.shippingType !== "Egal") {
      parts.push(rule.shippingType);
    } 

    // Part 3: Originalverpackt
    if (rule.packageOpened === "yes") {
      parts.push("originalverpackt");
    } else if (rule.packageOpened === "no") {
      parts.push("nicht originalverpackt");
    }

    return parts.filter(part => part).join(", ");
  };