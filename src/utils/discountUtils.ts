
export function getTriggerLabel(trigger: string): string {
  return trigger;
}

export function getRequestTypeLabel(requestType: string): string {
  return requestType;
}

export function getCalculationBaseLabel(calculationBase: string): string {
  switch (calculationBase) {
    case 'prozent_vom_vk':
      return 'Prozentsatz vom Verkaufspreis';
    case 'fester_betrag':
      return 'Fester Betrag';
    case 'preisstaffel':
      return 'Preisstaffelung';
    case 'angebotsstaffel':
      return 'Angebotsstaffelung';
    case 'keine_berechnung':
      return 'Keine automatische Berechnung';
    default:
      return calculationBase;
  }
}

export function getRoundingRuleLabel(roundingRule: string): string {
  switch (roundingRule) {
    case 'keine_rundung':
      return 'Keine Rundung';
    case 'auf_5_euro':
      return 'Auf 5€ runden';
    case 'auf_10_euro':
      return 'Auf 10€ runden';
    case 'auf_10_cent':
      return 'Auf 10 Cent runden';
    default:
      return roundingRule;
  }
}

export function getCostCenterLabel(costCenter: string): string {
  switch (costCenter) {
    case 'merchant':
      return 'Händler';
    case 'check24':
      return 'CHECK24';
    default:
      return costCenter;
  }
}

export function getReturnHandlingLabel(returnHandling: string): string {
  switch (returnHandling) {
    case 'automatisches_label':
      return 'Automatisches Retourenlabel';
    case 'manuelles_label':
      return 'Manuelles Retourenlabel';
    case 'zweitverwerter':
      return 'Zweitverwerter';
    case 'keine_retoure':
      return 'Keine Retoure';
    default:
      return returnHandling;
  }
}

export function getThresholdValueTypeLabel(valueType: string): string {
  switch (valueType) {
    case 'percent':
      return '%';
    case 'fixed':
      return '€';
    default:
      return valueType;
  }
}

export function getReturnStrategyLabel(strategy: string): string {
  switch (strategy) {
    case 'auto_return_full_refund':
      return 'Automatische Retoure mit voller Kostenerstattung';
    case 'discount_then_return':
      return 'Preisnachlass anbieten, bei Ablehnung Retoure';
    case 'discount_then_keep':
      return 'Preisnachlass anbieten, bei Ablehnung volle Erstattung ohne Rücksendung';
    default:
      return strategy;
  }
}

export function getShippingTypeLabel(shippingType: string): string {
  switch (shippingType) {
    case 'paket':
      return 'Paket';
    case 'spedition':
      return 'Spedition';
    default:
      return shippingType;
  }
}

/**
 * Calculates the discount amount based on the rule and sale price
 */
export function calculateDiscount(salePrice: number, rule: any): number | string {
  if (rule.returnStrategy === 'auto_return_full_refund') {
    return salePrice; // Full refund
  }

  if (!rule.calculationBase || rule.calculationBase === 'keine_berechnung') {
    return 'Manuelle Berechnung';
  }

  let amount = 0;
  
  // Calculate base amount
  switch (rule.calculationBase) {
    case 'prozent_vom_vk':
      amount = (salePrice * rule.value) / 100;
      break;
    case 'fester_betrag':
      amount = rule.value;
      break;
    default:
      return 'Komplexe Berechnung';
  }
  
  // Apply rounding
  switch (rule.roundingRule) {
    case 'keine_rundung':
      // No rounding needed
      break;
    case 'auf_5_euro':
      amount = Math.ceil(amount / 5) * 5;
      break;
    case 'auf_10_euro':
      amount = Math.ceil(amount / 10) * 10;
      break;
    case 'auf_10_cent':
      amount = Math.ceil(amount * 10) / 10;
      break;
    default:
      // No rounding for unknown rules
      break;
  }
  
  return amount;
}

/**
 * Formats a number or string as a currency (Euro)
 */
export function formatCurrency(amount: number | string): string {
  if (typeof amount === 'string') {
    return amount;
  }
  
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
