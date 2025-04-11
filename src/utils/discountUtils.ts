
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
