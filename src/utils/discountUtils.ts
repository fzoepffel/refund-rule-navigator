
import { RoundingRule } from "../models/ruleTypes";

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export function applyRounding(amount: number, roundingRule: RoundingRule): number {
  switch (roundingRule) {
    case 'keine_rundung':
      return amount;
    case 'auf_5_euro':
      return Math.ceil(amount / 5) * 5;
    case 'auf_10_euro':
      return Math.ceil(amount / 10) * 10;
    case 'auf_10_cent':
      return Math.ceil(amount * 10) / 10;
    default:
      return amount;
  }
}

export function calculateDiscount(salePrice: number, rule: any): number {
  if (!rule) return 0;
  
  let discount = 0;
  
  // Handle percentage-based discount
  if (rule.calculationBase === 'prozent_vom_vk' && rule.value) {
    discount = salePrice * (rule.value / 100);
  } 
  // Handle fixed amount
  else if (rule.calculationBase === 'fester_betrag' && rule.value) {
    discount = rule.value;
  } 
  // Handle price threshold calculation
  else if (rule.calculationBase === 'preisstaffel' && rule.priceThresholds) {
    // Find applicable threshold
    const threshold = rule.priceThresholds.find((t: any) => 
      salePrice >= t.minPrice && (!t.maxPrice || salePrice <= t.maxPrice)
    );
    
    if (threshold) {
      if (rule.calculationBase === 'prozent_vom_vk') {
        discount = salePrice * (threshold.value / 100);
      } else {
        discount = threshold.value;
      }
    }
  }
  
  // Apply rounding
  discount = applyRounding(discount, rule.roundingRule);
  
  // Apply maximum if specified
  if (rule.maxAmount && discount > rule.maxAmount) {
    discount = rule.maxAmount;
  }
  
  return discount;
}

export function getTriggerLabel(trigger: string): string {
  const labels: Record<string, string> = {
    'widerruf': 'Widerruf',
    'reklamation': 'Reklamation',
    'beschaedigte_ware_leicht': 'Ästhetischer Schaden',
    'beschaedigte_ware_mittel': 'Eingeschränkt benutzbar',
    'beschaedigte_ware_schwer': 'Stark eingeschränkt benutzbar',
    'beschaedigte_ware_unbrauchbar': 'Unbrauchbares Produkt',
    'fehlende_teile': 'Fehlende Teile',
    'geschmackssache': 'Geschmackssache',
    'sonstiges': 'Sonstiges'
  };
  return labels[trigger] || trigger;
}

export function getCalculationBaseLabel(base: string): string {
  const labels: Record<string, string> = {
    'prozent_vom_vk': 'Prozentsatz vom VK',
    'fester_betrag': 'Fester Betrag',
    'preisstaffel': 'Preisstaffel',
    'angebotsstaffel': 'Mehrstufiges Angebot'
  };
  return labels[base] || base;
}

export function getRoundingRuleLabel(rule: string): string {
  const labels: Record<string, string> = {
    'keine_rundung': 'Keine Rundung',
    'auf_5_euro': 'Aufrunden auf 5€',
    'auf_10_euro': 'Aufrunden auf 10€',
    'auf_10_cent': 'Aufrunden auf 10 Cent'
  };
  return labels[rule] || rule;
}

export function getCostCenterLabel(center: string): string {
  const labels: Record<string, string> = {
    'merchant': 'Merchant',
    'check24': 'CHECK24'
  };
  return labels[center] || center;
}

export function getReturnHandlingLabel(handling: string): string {
  const labels: Record<string, string> = {
    'automatisches_label': 'Automatisches Retourenlabel',
    'manuelles_label': 'Manuelle Erstellung durch Partner',
    'zweitverwerter': 'Zweitverwerter',
    'keine_retoure': 'Keine Retoure notwendig'
  };
  return labels[handling] || handling;
}
