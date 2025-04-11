
import { 
  Trigger, 
  RequestType, 
  CalculationBase, 
  RoundingRule, 
  CostCenter, 
  ReturnHandling,
  ThresholdValueType
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
    'angebotsstaffel': 'Mehrere Angebotsstufen'
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
