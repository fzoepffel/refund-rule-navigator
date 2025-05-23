import React, { useState, useEffect, useRef } from "react";
import { 
  Trigger, 
  CalculationBase, 
  RoundingRule, 
  ThresholdValueType,
  PriceThreshold,
  ShippingType,
  DiscountLevel,
  DiscountRule
} from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel,
  generateRuleName
} from "../utils/discountUtils";
import { IconArrowLeft, IconPlus, IconMinus, IconDeviceFloppy, IconAlertCircle, IconArrowRight, IconInfoCircle, IconQuestionMark, IconMessageCircleQuestion, IconHelp } from '@tabler/icons-react';
import { 
  Paper, 
  Chip,
  TextInput, 
  NumberInput, 
  ActionIcon, 
  Select as MantineSelect,
  Button as MantineButton,
  Text,
  Group,
  Stack,
  Checkbox as MantineCheckbox,
  Textarea as MantineTextarea,
  Title,
  MultiSelect,
  Box,
  Alert as MantineAlert,
  Tooltip,
  Radio,
  Divider,
  Alert,
  List
} from '@mantine/core';

interface RuleFormProps {
  rule?: DiscountRule;
  existingRules: DiscountRule[];
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
  onSelectOverlappingRule: (rule: DiscountRule) => void;
}

interface FormData {
  triggers: string[];
  priceThreshold: number;
  partnerConsultation: boolean;
}

const defaultRule: DiscountRule = {
  id: "",
  triggers: [
    'Geschmacksretoure',
    'Mangel',
    'Artikel beschädigt/funktioniert nicht mehr',
    'Versandverpackung und Artikel beschädigt',
    'Teile oder Zubehör fehlen',
    'Falscher Artikel'
  ],
  calculationBase: "prozent_vom_vk",
  roundingRule: "keine_rundung",
  shippingType: "Egal",
  packageOpened: "Egal",
  value: 10,
  consultPartnerBeforePayout: true,
  hasMultipleStages: false,
  calculationStages: [{
    calculationBase: "prozent_vom_vk",
    value: 10,
    roundingRule: "keine_rundung"
  }],
};

// Add this new component before the RuleForm component
interface PriceThresholdInputProps {
  threshold: PriceThreshold;
  index: number;
  stageIndex: number;
  isLastThreshold: boolean;
  onRemove: () => void;
  onChange: (field: keyof PriceThreshold, value: any) => void;
  roundingRules: RoundingRule[];
}

// Add this component before the RuleForm component
interface RoundingRuleSelectProps {
  value: RoundingRule;
  onChange: (value: RoundingRule) => void;
  roundingRules: RoundingRule[];
}

const RoundingRuleSelect: React.FC<RoundingRuleSelectProps> = ({
  value,
  onChange,
  roundingRules
}) => {
  return (
    <div>
      <Group gap="xs" mb={5}>
        <Text style={{ fontSize: 20 }}>Rundungsregel</Text>
        <Tooltip
          styles={{
            tooltip: {
              whiteSpace: 'pre-line', // Enables \n line breaks
              fontSize: 14,
            },
          }}
          label={
            <Text>
              Legen Sie fest, wie der berechnete Nachlassbetrag gerundet werden soll:{"\n"}
              - Keine Rundung: Exakter berechneter Betrag{"\n"}
              - Auf 5 Euro: Betrag wird auf nächste 5€ gerundet (z.B. 12€ → 15€, 16€ → 20€){"\n"}
              - Auf 10 Euro: Betrag wird auf nächste 10€ gerundet (z.B. 12€ → 20€, 27€ → 30€){"\n"}
              - Auf 1 Euro: Betrag wird auf nächsten Euro gerundet (z.B. 1,30€ → 2€, 12,70€ → 13€)
            </Text>
          }
        >
          <IconHelp             size={20} style={{ color: '#0563C1' }} />
        </Tooltip>
      </Group>
      <MantineSelect
        value={value}
        onChange={(value) => onChange(value as RoundingRule)}
        data={roundingRules.map(rule => ({
          value: rule,
          label: getRoundingRuleLabel(rule)
        }))}
        styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
      />
    </div>
  );
};

// Update the PriceThresholdInput component
const PriceThresholdInput: React.FC<PriceThresholdInputProps> = ({
  threshold,
  index,
  stageIndex,
  isLastThreshold,
  onRemove,
  onChange,
  roundingRules
}) => {
  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group grow>
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Min (€)</Text>
            <NumberInput
              value={threshold.minPrice}
              disabled
              styles={{ input: { backgroundColor: 'var(--mantine-color-gray-1)', fontSize: 20 } }}
            />
          </div>
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Max (€)</Text>
            <NumberInput
              value={threshold.maxPrice || undefined}
              onChange={(value) => onChange('maxPrice', value)}
              min={threshold.minPrice + 1}
              placeholder={isLastThreshold ? "Unbegrenzt" : ""}
              styles={{ input: { fontSize: 18 } }}
            />
          </div>
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Wert</Text>
            <NumberInput
              value={threshold.value}
              onChange={(value) => onChange('value', value)}
              min={0}
              styles={{ input: { fontSize: 18 } }}
            />
          </div>
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Art</Text>
            <MantineSelect
              value={threshold.valueType || 'percent'}
              onChange={(value) => onChange('valueType', value as ThresholdValueType)}
              data={[
                { value: 'percent', label: '%' },
                { value: 'fixed', label: '€' }
              ]}
              styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
            />
          </div>
        </Group>
        <RoundingRuleSelect
          value={threshold.roundingRule}
          onChange={(value) => onChange('roundingRule', value)}
          roundingRules={roundingRules}
        />
        {isLastThreshold && index > 0 && (
          <Group justify="flex-end">
            <MantineButton
              variant="subtle"
              color="blue"
              size="sm"
              onClick={onRemove}
              style={{ fontSize: 20, fontWeight: 400 }}
            >
              Staffel löschen
            </MantineButton>
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

// Add this component before the RuleForm component
interface MaximalbetragFieldProps {
  value: number | '';
  onChange: (value: number | '') => void;
}

const MaximalbetragField: React.FC<MaximalbetragFieldProps> = ({
  value,
  onChange
}) => {
  return (
    <div style={{ maxWidth: '300px' }}>
      <Group gap="xs" mb={5}>
        <Text style={{ fontSize: 20 }}>Maximalbetrag</Text>
        <Tooltip
          styles={{
            tooltip: {
              whiteSpace: 'pre-line',
              fontSize: 14,
            },
          }}
          label={
            <Text>
              Legen Sie eine Obergrenze für den Preisnachlass fest.{"\n"}
              Der berechnete Nachlass wird nie diesen Betrag überschreiten.{"\n"}
              Beispiel: Bei 20% Nachlass und Maximalbetrag 50€ wird bei{" "}
              einem 1000€ Artikel nur 50€ (statt 200€) abgezogen.
            </Text>
          }
        >
          <IconHelp size={20} style={{ color: '#0563C1' }} />
        </Tooltip>
      </Group>
      <NumberInput
        value={value}
        onChange={onChange}
        min={0}
        rightSection={<Text>€</Text>}
        rightSectionWidth={30}
        styles={{ input: { fontSize: 18 } }}
      />
    </div>
  );
};

// Add this component before the RuleForm component
interface CalculationFieldProps {
  type: 'prozent_vom_vk' | 'fester_betrag';
  value: number;
  onChange: (value: number) => void;
  roundingRule?: RoundingRule;
  onRoundingRuleChange?: (value: RoundingRule) => void;
  roundingRules?: RoundingRule[];
  maxAmount?: number | '';
  onMaxAmountChange?: (value: number | '') => void;
  hasMultipleStages: boolean;
}

const CalculationField: React.FC<CalculationFieldProps> = ({
  type,
  value,
  onChange,
  roundingRule,
  onRoundingRuleChange,
  roundingRules,
  maxAmount,
  onMaxAmountChange,
  hasMultipleStages
}) => {
  return (
    <div>
      {type === 'prozent_vom_vk' ? (
        <Group grow align="flex-start">
          <div>
            <Group gap="xs" mb={5}>
              <Text style={{ fontSize: 20 }}>Prozentsatz</Text>
              <Tooltip
                styles={{
                  tooltip: {
                    whiteSpace: 'pre-line',
                    fontSize: 14,
                  },
                }}
                label={
                  <Text>
                    Geben Sie den Prozentsatz ein, der vom Verkaufspreis abgezogen werden soll.
                    {'\n'}Beispiel: Bei 10% und einem Artikelpreis von 100€ beträgt der Nachlass 10€.
                  </Text>
                }
              >
                <IconHelp size={20} style={{ color: '#0563C1' }} />
              </Tooltip>
            </Group>
            <NumberInput
              value={value || 0}
              onChange={onChange}
              min={0}
              max={100}
              rightSection={<Text>%</Text>}
              rightSectionWidth={30}
              styles={{ input: { fontSize: 18 } }}
            />
          </div>

          {roundingRule && onRoundingRuleChange && roundingRules && (
            <div>
              <Group gap="xs" mb={5}>
                <Text style={{ fontSize: 20 }}>Rundungsregel</Text>
                <Tooltip
                  styles={{
                    tooltip: {
                      whiteSpace: 'pre-line',
                      fontSize: 14,
                    },
                  }}
                  label={
                    <Text>
                      Legen Sie fest, wie der berechnete Nachlassbetrag gerundet werden soll:{"\n"}
                      - Keine Rundung: Exakter berechneter Betrag{"\n"}
                      - Auf 5 Euro: Betrag wird auf nächste 5€ gerundet (z.B. 12€ → 15€, 16€ → 20€){"\n"}
                      - Auf 10 Euro: Betrag wird auf nächste 10€ gerundet (z.B. 12€ → 20€, 27€ → 30€){"\n"}
                      - Auf 1 Euro: Betrag wird auf nächsten Euro gerundet (z.B. 1,30€ → 2€, 12,70€ → 13€)
                    </Text>
                  }
                >
                  <IconHelp size={20} style={{ color: '#0563C1' }} />
                </Tooltip>
              </Group>
              <MantineSelect
                value={roundingRule}
                onChange={(value) => onRoundingRuleChange(value as RoundingRule)}
                data={roundingRules.map(rule => ({
                  value: rule,
                  label: getRoundingRuleLabel(rule)
                }))}
                styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
              />
            </div>
          )}

          {!hasMultipleStages && (
            <MaximalbetragField
              value={maxAmount || ''}
              onChange={onMaxAmountChange}
            />
          )}
        </Group>
      ) : (
        <div style={{ maxWidth: '300px' }}>
          <Group gap="xs" mb={5}>
            <Text style={{ fontSize: 20 }}>Betrag (€)</Text>
            <Tooltip
              styles={{
                tooltip: {
                  whiteSpace: 'pre-line',
                  fontSize: 14,
                },
              }}
              label={
                <Text>
                  Geben Sie den festen Euro-Betrag ein, der vom Verkaufspreis abgezogen werden soll.
                  {'\n'}Dieser Betrag wird unabhängig vom Artikelpreis abgezogen.
                </Text>
              }
            >
              <IconHelp size={20} style={{ color: '#0563C1' }} />
            </Tooltip>
          </Group>
          <NumberInput
            value={value || 0}
            onChange={onChange}
            min={0}
            rightSection={<Text>€</Text>}
            rightSectionWidth={30}
            styles={{ input: { fontSize: 18 } }}
          />
        </div>
      )}
    </div>
  );
};

// Create a reusable PriceThresholdSection component
interface PriceThresholdSectionProps {
  priceThresholds?: PriceThreshold[];
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof PriceThreshold, value: any) => void;
  roundingRules: RoundingRule[];
  stageIndex: number;
  maxAmount?: number | '';
  onMaxAmountChange?: (value: number | '') => void;
}

const PriceThresholdSection: React.FC<PriceThresholdSectionProps> = ({
  priceThresholds,
  onRemove,
  onChange,
  roundingRules,
  stageIndex,
  maxAmount,
  onMaxAmountChange
}) => {
  return (
    <div className="space-y-4">
      <Group gap="xs">
        <Text style={{fontSize: 20}}>Preisstaffelung</Text>
        <Tooltip
          styles={{
            tooltip: {
              whiteSpace: 'pre-line',
              fontSize: 14,
            },
          }}
          label={
            <Text>
              Definieren Sie verschiedene Nachlässe je nach Artikelpreis.
              {'\n'}Beispiel: Artikel bis 50€ erhalten 10% Nachlass,
              {'\n'}Artikel von 50€ bis 100€ erhalten 15% Nachlass, usw.
            </Text>
          }
        >
          <IconHelp             size={20} style={{ color: '#0563C1' }} />
        </Tooltip>
      </Group>
      {(priceThresholds || []).map((threshold, index) => (
        <PriceThresholdInput
          key={index}
          threshold={threshold}
          index={index}
          stageIndex={stageIndex}
          isLastThreshold={index === (priceThresholds?.length || 0) - 1}
          onRemove={() => onRemove(index)}
          onChange={(field, value) => onChange(index, field, value)}
          roundingRules={roundingRules}
        />
      ))}
      <div style={{ maxWidth: '300px' }}>
        <Group gap="xs" mb={5}>
          <Text style={{ fontSize: 20 }}>Maximalbetrag</Text>
          <Tooltip
            styles={{
              tooltip: {
                whiteSpace: 'pre-line',
                fontSize: 14,
              },
            }}
            label={
              <Text>
                Legen Sie eine Obergrenze für den Preisnachlass fest.{"\n"}
                Der berechnete Nachlass wird nie diesen Betrag überschreiten.{"\n"}
                Beispiel: Bei 20% Nachlass und Maximalbetrag 50€ wird bei{" "}
                einem 1000€ Artikel nur 50€ (statt 200€) abgezogen.
              </Text>
            }
          >
            <IconHelp size={20} style={{ color: '#0563C1' }} />
          </Tooltip>
        </Group>
        <NumberInput
          value={maxAmount || ''}
          onChange={onMaxAmountChange}
          min={0}
          rightSection={<Text>€</Text>}
          rightSectionWidth={30}
          styles={{ input: { fontSize: 18 } }}
        />
      </div>
    </div>
  );
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, existingRules, onSave, onCancel, onSelectOverlappingRule }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formRect, setFormRect] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Update the getInitialFormData function
  const getInitialFormData = () => {
    if (rule) {
      return {
        ...rule,
      };
    }
    // Create a deep copy of the default rule
    return JSON.parse(JSON.stringify(defaultRule));
  };

  const [formData, setFormData] = useState<DiscountRule>(getInitialFormData());
  
  // Update the useEffect to handle the initial form data
  useEffect(() => {
    if (rule) {
      setFormData({
        ...rule,
      });
    } else {
      // Reset to a fresh copy of default rule when creating new rule
      setFormData(getInitialFormData());
    }
  }, [rule]);
  
  const mainTriggers: Trigger[] = ['Geschmacksretoure', 'Mangel'];
  const mangelTriggers: Trigger[] = [
    'Artikel beschädigt/funktioniert nicht mehr',
    'Versandverpackung und Artikel beschädigt',
    'Teile oder Zubehör fehlen',
    'Falscher Artikel'
  ];
  
  const calculationBases: CalculationBase[] = ['prozent_vom_vk', 'fester_betrag', 'preisstaffel'];
  const roundingRules: RoundingRule[] = ['keine_rundung', 'auf_5_euro', 'auf_10_euro', 'auf_1_euro'];
  const shippingTypes: ShippingType[] = ['Egal', 'Paket', 'Spedition'];
  
  // Add new state for validation
  const [showCalculation, setShowCalculation] = useState(!!rule);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [overlappingRules, setOverlappingRules] = useState<DiscountRule[]>([]);

  // Add state to track if basic info has been changed
  const [basicInfoChanged, setBasicInfoChanged] = useState(false);

  // Update the effect to handle both new and existing rules
  useEffect(() => {
    // Only hide calculation section if a basic info field is changed after initial load
    if (basicInfoChanged) {
      setShowCalculation(false);
    }
    setValidationError(null);
    setOverlappingRules([]);
  }, [formData.triggers, formData.shippingType, formData.packageOpened]);

  // Update the validation function to handle both new and existing rules
  const validateRuleOverlap = () => {
    // Get all rules except the current one being edited
    const rulesToCheck = existingRules.filter(r => r.id !== formData.id);

    // Get all specific Mangel triggers
    const mangelTriggers: Trigger[] = [
      'Artikel beschädigt/funktioniert nicht mehr',
      'Versandverpackung und Artikel beschädigt',
      'Teile oder Zubehör fehlen',
      'Falscher Artikel'
    ];

    // Helper function to check if a set of triggers has all Mangel triggers
    const hasAllMangelTriggers = (triggers: Trigger[]) => {
      return mangelTriggers.every(trigger => triggers.includes(trigger));
    };

    // Helper function to check if two sets of triggers overlap
    const doTriggersOverlap = (triggers1: Trigger[], triggers2: Trigger[]) => {
      // If either set is empty, there's no overlap
      if (triggers1.length === 0 || triggers2.length === 0) return false;

      // Check each trigger in the first set
      return triggers1.some(trigger1 => {
        // If trigger1 is a specific Mangel trigger
        if (mangelTriggers.includes(trigger1)) {
          // Only overlap if the exact same specific Mangel trigger exists in both sets
          return triggers2.includes(trigger1);
        }
        // If trigger1 is "Mangel"
        if (trigger1 === 'Mangel') {
          // Only overlap if the other set has all Mangel triggers
          return hasAllMangelTriggers(triggers2);
        }
        // For non-Mangel triggers, check for exact match
        return triggers2.includes(trigger1);
      });
    };

    // Helper function to check if shipping types overlap
    const doShippingTypesOverlap = (type1: ShippingType, type2: ShippingType) => {
      // If either is "Egal", they overlap
      if (type1 === 'Egal' || type2 === 'Egal') return true;
      // Otherwise, they must match exactly
      return type1 === type2;
    };

    // Helper function to check if package opened status overlaps
    const doPackageOpenedOverlap = (status1: 'yes' | 'no' | 'Egal', status2: 'yes' | 'no' | 'Egal') => {
      // If either is "Egal", they overlap
      if (status1 === 'Egal' || status2 === 'Egal') return true;
      // Otherwise, they must match exactly
      return status1 === status2;
    };

    // Check for overlaps
    const overlappingRules = rulesToCheck.filter(existingRule => {
      // Check if shipping types overlap
      const shippingTypeOverlap = doShippingTypesOverlap(formData.shippingType, existingRule.shippingType);

      // Check if package opened status overlaps
      const packageOpenedOverlap = doPackageOpenedOverlap(formData.packageOpened, existingRule.packageOpened);

      // Check if triggers overlap
      const triggerOverlap = doTriggersOverlap(formData.triggers, existingRule.triggers);

      // If all conditions overlap, there's a conflict
      return shippingTypeOverlap && packageOpenedOverlap && triggerOverlap;
    });

    if (overlappingRules.length > 0) {
      setOverlappingRules(overlappingRules);
      setValidationError("Diese Regel überschneidet sich mit einer bestehenden Regel. Bitte passen Sie die Grundinformationen an.");
      setShowCalculation(false);
    } else {
      setValidationError(null);
      setOverlappingRules([]);
      setShowCalculation(true);
      setBasicInfoChanged(false); // Reset the changed state after successful validation
    }
  };

  // Effect to handle Mangel trigger selection/deselection
  useEffect(() => {
    if (formData.triggers.includes('Mangel')) {
      // Keep existing Mangel triggers if any are selected
      const existingMangelTriggers = formData.triggers.filter(trigger => mangelTriggers.includes(trigger));
      if (existingMangelTriggers.length === 0) {
        // Only add all Mangel triggers if none are currently selected
        const newTriggers = [...formData.triggers];
        mangelTriggers.forEach(trigger => {
          if (!newTriggers.includes(trigger)) {
            newTriggers.push(trigger);
          }
        });
        setFormData(prev => ({ ...prev, triggers: newTriggers }));
      }
    } else {
      // Remove all Mangel triggers if Mangel is deselected
      const newTriggers = formData.triggers.filter(trigger => !mangelTriggers.includes(trigger));
      setFormData(prev => ({ ...prev, triggers: newTriggers }));
    }
  }, [formData.triggers.includes('Mangel')]);
  

  const handleChange = (field: keyof DiscountRule, value: any) => {
      setFormData(prev => ({
        ...prev,
      [field]: value
    }));

    // If any basic info field is changed, set basicInfoChanged to true
    if (['triggers', 'shippingType', 'packageOpened'].includes(field)) {
      setBasicInfoChanged(true);
      setShowCalculation(false);
    }
  };
  
  // Set the trigger directly when selected from radio group
  const setTrigger = (trigger: Trigger) => {
    setFormData(prev => {
      const currentTriggers = prev.triggers || [];
      if (currentTriggers.includes(trigger)) {
        // Remove trigger if already selected
        return {
      ...prev,
          triggers: currentTriggers.filter(t => t !== trigger)
        };
      } else {
        // Add trigger if not already selected
        return {
          ...prev,
          triggers: [...currentTriggers, trigger]
        };
      }
    });
    setBasicInfoChanged(true);
    setShowCalculation(false);
  };

  const getSelectedTriggerLabel = () => {
    if (formData.triggers.length === 0) {
      return "Egal";
    }
    if (formData.triggers.length === 1) {
    return getTriggerLabel(formData.triggers[0]);
    }
    return "Mehrere Gründe";
  };
  
  const handleAddPriceThreshold = (stageIndex: number) => {
    if (formData.hasMultipleStages) {
      setFormData(prev => {
        const stages = [...(prev.calculationStages || [])];
        const thresholds = [...(stages[stageIndex].priceThresholds || [])];
    const lastThreshold = thresholds[thresholds.length - 1];
    const newMin = lastThreshold ? (lastThreshold.maxPrice || lastThreshold.minPrice + 1) : 0;
    
        thresholds.push({
          minPrice: newMin,
          value: 10,
          valueType: 'percent',
          roundingRule: 'keine_rundung'
        });
        
        stages[stageIndex] = { ...stages[stageIndex], priceThresholds: thresholds };
        return { ...prev, calculationStages: stages };
      });
    } else {
      setFormData(prev => {
        const thresholds = [...(prev.priceThresholds || [])];
        const lastThreshold = thresholds[thresholds.length - 1];
        const newMin = lastThreshold ? (lastThreshold.maxPrice || lastThreshold.minPrice + 1) : 0;
        
        thresholds.push({
          minPrice: newMin,
          value: 10,
          valueType: 'percent',
          roundingRule: 'keine_rundung'
        });
        
        return { ...prev, priceThresholds: thresholds };
      });
    }
  };
  
  const handleRemovePriceThreshold = (stageIndex: number, thresholdIndex: number) => {
    if (formData.hasMultipleStages) {
      setFormData(prev => {
        const stages = [...(prev.calculationStages || [])];
        const thresholds = [...(stages[stageIndex].priceThresholds || [])];
        
        // Only allow removing the last threshold
        if (thresholdIndex !== thresholds.length - 1) return prev;
        
        // If this is the last threshold, don't remove it
        if (thresholds.length <= 1) return prev;
        
        // Remove the threshold
        thresholds.splice(thresholdIndex, 1);
        
        // Set the previous threshold's max to undefined
        if (thresholdIndex > 0) {
          thresholds[thresholdIndex - 1] = {
            ...thresholds[thresholdIndex - 1],
            maxPrice: undefined
          };
        }
        
        stages[stageIndex] = { ...stages[stageIndex], priceThresholds: thresholds };
        return { ...prev, calculationStages: stages };
      });
    } else {
    setFormData(prev => {
      const thresholds = [...(prev.priceThresholds || [])];
        
        // Only allow removing the last threshold
        if (thresholdIndex !== thresholds.length - 1) return prev;
        
        // If this is the last threshold, don't remove it
        if (thresholds.length <= 1) return prev;
        
        // Remove the threshold
        thresholds.splice(thresholdIndex, 1);
        
        // Set the previous threshold's max to undefined
        if (thresholdIndex > 0) {
          thresholds[thresholdIndex - 1] = {
            ...thresholds[thresholdIndex - 1],
            maxPrice: undefined
          };
        }
        
      return { ...prev, priceThresholds: thresholds };
    });
    }
  };
  
  const handlePriceThresholdChange = (stageIndex: number, thresholdIndex: number, field: keyof PriceThreshold, value: any) => {
    if (formData.hasMultipleStages) {
      setFormData(prev => {
        const stages = [...(prev.calculationStages || [])];
        const thresholds = [...(stages[stageIndex].priceThresholds || [])];
        
        // Update the current threshold
        thresholds[thresholdIndex] = { ...thresholds[thresholdIndex], [field]: value };
        
        // If max price is set and this is the last threshold, add a new one
        if (field === 'maxPrice' && value && thresholdIndex === thresholds.length - 1) {
          thresholds.push({
            minPrice: value,
            value: 10,
            valueType: 'percent',
            roundingRule: 'keine_rundung'
          });
        }
        
        // Update min price of next threshold to match max price of current threshold
        if (field === 'maxPrice' && thresholdIndex < thresholds.length - 1) {
          thresholds[thresholdIndex + 1] = {
            ...thresholds[thresholdIndex + 1],
            minPrice: value
          };
        }
        
        stages[stageIndex] = { ...stages[stageIndex], priceThresholds: thresholds };
        return { ...prev, calculationStages: stages };
      });
    } else {
      setFormData(prev => {
        const thresholds = [...(prev.priceThresholds || [])];
        
        // Update the current threshold
        thresholds[thresholdIndex] = { ...thresholds[thresholdIndex], [field]: value };
        
        // If max price is set and this is the last threshold, add a new one
        if (field === 'maxPrice' && value && thresholdIndex === thresholds.length - 1) {
          thresholds.push({
            minPrice: value,
            value: 10,
            valueType: 'percent',
            roundingRule: 'keine_rundung'
          });
        }
        
        // Update min price of next threshold to match max price of current threshold
        if (field === 'maxPrice' && thresholdIndex < thresholds.length - 1) {
          thresholds[thresholdIndex + 1] = {
            ...thresholds[thresholdIndex + 1],
            minPrice: value
          };
        }
        
        return { ...prev, priceThresholds: thresholds };
      });
    }
  };
  
  const handleAddDiscountLevel = () => {
    setFormData(prev => ({
      ...prev,
      discountLevels: [
        ...(prev.discountLevels || []),
        { value: 10, valueType: 'percent', roundingRule: 'keine_rundung' }
      ]
    }));
  };
  
  const handleDiscountLevelChange = (index: number, field: keyof DiscountLevel, value: any) => {
    setFormData(prev => {
      const levels = [...(prev.discountLevels || [])];
      levels[index] = { ...levels[index], [field]: value };
      return { ...prev, discountLevels: levels };
    });
  };
  
  const handleRemoveDiscountLevel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      discountLevels: prev.discountLevels?.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      // Generate a unique ID if this is a new rule
      id: rule?.id || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    onSave(finalData);
  };

  const renderCalculationFields = (stage: {
    calculationBase: CalculationBase;
    value?: number;
    priceThresholds?: PriceThreshold[];
    roundingRule?: RoundingRule;
  }, stageIndex: number) => {
    const isMultiStage = formData.hasMultipleStages;
    const priceThresholds = isMultiStage ? stage.priceThresholds : formData.priceThresholds;

    switch (stage.calculationBase) {
      case 'prozent_vom_vk':
        return (
          <CalculationField
            type="prozent_vom_vk"
            value={stage.value || 0}
            onChange={(value) => handleCalculationStageChange(stageIndex, 'value', value)}
            roundingRule={stage.roundingRule}
            onRoundingRuleChange={(value) => handleCalculationStageChange(stageIndex, 'roundingRule', value)}
            roundingRules={roundingRules}
            maxAmount={formData.maxAmount || ''}
            onMaxAmountChange={(value) => handleChange("maxAmount", value)}
            hasMultipleStages={formData.hasMultipleStages}
          />
        );
      case 'fester_betrag':
        return (
          <CalculationField
            type="fester_betrag"
            value={stage.value || 0}
            onChange={(value) => handleCalculationStageChange(stageIndex, 'value', value)}
            maxAmount={formData.maxAmount || ''}
            onMaxAmountChange={(value) => handleChange("maxAmount", value)}
            hasMultipleStages={formData.hasMultipleStages}
          />
        );
      case 'preisstaffel':
        return (
          <PriceThresholdSection
            priceThresholds={priceThresholds}
            onRemove={(index) => handleRemovePriceThreshold(stageIndex, index)}
            onChange={(index, field, value) => handlePriceThresholdChange(stageIndex, index, field, value)}
            roundingRules={roundingRules}
            stageIndex={stageIndex}
            maxAmount={formData.maxAmount || ''}
            onMaxAmountChange={(value) => handleChange("maxAmount", value)}
          />
        );
      default:
        return null;
    }
  };

  const handleAddCalculationStage = () => {
    setFormData(prev => ({
      ...prev,
      calculationStages: [
        ...(prev.calculationStages || []),
        { calculationBase: "prozent_vom_vk", value: 10, roundingRule: "keine_rundung" }
      ]
    }));
  };

  const handleRemoveCalculationStage = (index: number) => {
    setFormData(prev => {
      const stages = [...(prev.calculationStages || [])];
      
      // If this is the last stage, don't remove it
      if (stages.length <= 1) return prev;
      
      // Remove the stage
      stages.splice(index, 1);
      
      // If only one stage remains, convert back to single-stage mode
      if (stages.length === 1) {
        const lastStage = stages[0];
        return {
          ...prev,
          hasMultipleStages: false,
          calculationBase: lastStage.calculationBase,
          value: lastStage.value,
          roundingRule: lastStage.roundingRule,
          priceThresholds: lastStage.priceThresholds,
          calculationStages: undefined
        };
      }
      
      return { ...prev, calculationStages: stages };
    });
  };
  
  const handleCalculationStageChange = (index: number, field: keyof typeof formData.calculationStages[0], value: any) => {
    setFormData(prev => {
      const stages = [...(prev.calculationStages || [])];
      stages[index] = { ...stages[index], [field]: value };
      
      // If calculation base is changed to preisstaffel, create first threshold if none exists
      if (field === 'calculationBase' && value === 'preisstaffel') {
        if (!stages[index].priceThresholds || stages[index].priceThresholds.length === 0) {
          stages[index] = {
            ...stages[index],
            priceThresholds: [{
              minPrice: 0,
              value: 10,
              valueType: 'percent',
              roundingRule: 'keine_rundung'
            }]
          };
        }
      }
      
      return { ...prev, calculationStages: stages };
    });
  };

  // Add calculation functions from RuleCalculator
  const calculateRefund = (price: number, stage: typeof formData.calculationStages[0]) => {
    if (!stage) return 0;

    let refund = 0;
      
    switch (stage.calculationBase) {
      case 'prozent_vom_vk':
        refund = (price * (stage.value || 0)) / 100;
        if (stage.roundingRule) {
          refund = applyRoundingRule(refund, stage.roundingRule);
        }
        break;
      case 'fester_betrag':
        refund = stage.value || 0;
        if (stage.roundingRule) {
          refund = applyRoundingRule(refund, stage.roundingRule);
        }
        break;
      case 'preisstaffel':
        const threshold = stage.priceThresholds?.find(t => 
          price >= t.minPrice && (!t.maxPrice || price <= t.maxPrice)
        );
        if (!threshold) return 0;
        refund = threshold.valueType === 'percent' 
          ? (price * threshold.value) / 100 
          : threshold.value;
        if (threshold.roundingRule) {
          refund = applyRoundingRule(refund, threshold.roundingRule);
        }
        break;
      default:
        return 0;
    }

    return refund;
  };

  const applyRoundingRule = (amount: number, rule: string): number => {
    switch (rule) {
      case 'keine_rundung':
        return amount;
      case 'auf_5_euro':
        return Math.ceil(amount / 5) * 5;
      case 'auf_10_euro':
        return Math.ceil(amount / 10) * 10;
      case 'auf_1_euro':
        return Math.ceil(amount);
      default:
        return amount;
    }
  };

  const getAllRefunds = (price: number) => {
    if (!formData.hasMultipleStages) {
      let refund = 0;
      
      switch (formData.calculationBase) {
        case 'prozent_vom_vk':
          refund = (price * (formData.value || 0)) / 100;
          if (formData.roundingRule) {
            refund = applyRoundingRule(refund, formData.roundingRule);
          }
          break;
        case 'fester_betrag':
          refund = formData.value || 0;
          if (formData.roundingRule) {
            refund = applyRoundingRule(refund, formData.roundingRule);
          }
          break;
        case 'preisstaffel':
          const threshold = formData.priceThresholds?.find(t => 
            price >= t.minPrice && (!t.maxPrice || price <= t.maxPrice)
          );
          if (!threshold) return [0];
          refund = threshold.valueType === 'percent' 
            ? (price * threshold.value) / 100 
            : threshold.value;
          if (threshold.roundingRule) {
            refund = applyRoundingRule(refund, threshold.roundingRule);
          }
          break;
        default:
          return [0];
      }

      if (formData.maxAmount && refund > formData.maxAmount) {
        refund = formData.maxAmount;
      }
    
      return [refund];
    }

    if (!formData.calculationStages || formData.calculationStages.length === 0) return [0];
    
    return formData.calculationStages.map(stage => {
      let refund = calculateRefund(price, stage);
      
      if (stage.maxAmount && refund > stage.maxAmount) {
        refund = stage.maxAmount;
      }
      
      if (formData.maxAmount && refund > formData.maxAmount) {
        refund = formData.maxAmount;
      }
      
      return refund;
    });
  };

  // Track form position and width
  useEffect(() => {
    const updateRect = () => {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        setFormRect({ left: rect.left, width: rect.width });
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  const handleConvertToMultiStage = () => {
    setFormData(prev => ({
      ...prev,
      hasMultipleStages: true,
      calculationStages: [
        {
          calculationBase: prev.calculationBase,
          value: prev.value,
          roundingRule: prev.roundingRule,
          priceThresholds: prev.priceThresholds
        },
        {
          calculationBase: "prozent_vom_vk",
          value: 10,
          roundingRule: "keine_rundung"
        }
      ]
    }));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" style={{ position: 'relative' }}>
      <Group>
        <MantineButton type="button" variant="subtle" size="sm" onClick={onCancel}>
          <IconArrowLeft className="h-6 w-6" />
        </MantineButton>
        <Text style={{ flex: 1, fontSize: 24 }}>
          {rule ? "Regel bearbeiten" : "Neue Regel erstellen"}
        </Text>
      </Group>
      
      <Paper p="md">
        <Stack gap="md">
          <div>
            <Group gap="xs">
              <Text style={{ fontSize: 24 }}>Regeldefinition</Text>
              <Tooltip
                styles={{
                  tooltip: {
                    whiteSpace: 'pre-line',
                    fontSize: 14,
                  },
                }}
                label={
                  <Text>
                    Hier definieren Sie den Fall, für den diese Preisnachlassregel erstellt werden soll. 
                    {"\n"}Sie können eine beliebige Anzahl an Regeln für beliebige Fälle definieren. 
                    {"\n"}Wenn Sie in einem der Menüs "Egal" auswählen, gilt die Regel für alle Fälle – sofern nicht anders angegeben.
                  </Text>
                }
              >
                <IconHelp size={20} style={{ color: '#0563C1' }} />
              </Tooltip>
            </Group>
          </div>
          
          {/* Gründe */}
          <div>

            <Stack gap="xs">
              <Group gap="xs">
                {mainTriggers.map(trigger => {
                  const isMangel = trigger === 'Mangel';
                  const allMangelTriggersSelected = isMangel && mangelTriggers.every(t => formData.triggers.includes(t));
                  const someMangelTriggersSelected = isMangel && mangelTriggers.some(t => formData.triggers.includes(t));
                  
                  return (
                    <Chip
                        key={trigger}
                      checked={formData.triggers.includes(trigger)}
                      onChange={() => setTrigger(trigger)}
                      variant={isMangel && someMangelTriggersSelected && !allMangelTriggersSelected ? "light" : "filled"}
                      style={isMangel && someMangelTriggersSelected && !allMangelTriggersSelected ? { color: '#0563C1' } : undefined}
                      styles={{
                        label: {
                          fontSize: '20px', // Or any other size you want
                          height: '40px',
                        },
                      }}
                      
                    >
                      {getTriggerLabel(trigger)}
                    </Chip>
                  );
                })}
                            <Tooltip
                  styles={{
                    tooltip: {
                      whiteSpace: 'pre-line', // Enables \n line breaks
                      fontSize: 14,
                    },
                  }}
                  label={
                    <Text>
                      Geschmacksretoure entspricht Widerruf und Mangel entspricht Reklamation. 
                      {'\n'}Für Widerruf und Reklamation einfach beide auswählen. 
                      {'\n'}Für speziellere Mängel kann zudem ein sekundärer Mangelgrund ausgewählt werden.
                    </Text>
                  }
                >
                  <IconHelp             size={20} style={{ color: '#0563C1' }} />
                </Tooltip>
              </Group>
              
              

              {formData.triggers.includes('Mangel') && (
                <Box pl="md" style={{ borderLeft: '2px solid #0563C1' }}>
                  <MultiSelect
                    label="Spezifische Mängel"
                    styles={{ label: { fontSize: 20, fontWeight: 400 }, input: { fontSize: 18 }, pill: { fontSize: 18, backgroundColor: 'white' }, option: { fontSize: 18 }}}
                    data={mangelTriggers.map(trigger => ({
                      value: trigger,
                      label: getTriggerLabel(trigger)
                    }))}
                    value={formData.triggers.filter(t => mangelTriggers.includes(t))}
                    onChange={(values) => {
                      // Remove all existing mangel triggers
                      const newTriggers = formData.triggers.filter(t => !mangelTriggers.includes(t));
                      // Add the selected ones back
                      const updatedTriggers = [...newTriggers, ...(values as Trigger[])];
                      
                      // If no specific Mangel triggers are selected, remove 'Mangel' from triggers
                      if (values.length === 0) {
                        const finalTriggers = updatedTriggers.filter(t => t !== 'Mangel');
                        setFormData(prev => ({
                          ...prev,
                          triggers: finalTriggers
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          triggers: updatedTriggers
                        }));
                      }
                      setBasicInfoChanged(true);
                      setShowCalculation(false);
                    }}
                    searchable
                    clearable
                    style={{ color: '#0563C1' }}
                  />
                  <Text style={{fontSize: 14}} c="dimmed" mt="xs">
                    Für generelle Mängel (Reklamationen) einfach alle Spezifischen Mängel ausgewählt lassen.
                  </Text>
                </Box>
              )}
            </Stack>
          </div>

          {/* Versandart */}
          <div>
            <Group gap="xs" mb={5}>
              <Text style={{ fontSize: 20 }}>Versandart</Text>
              <Tooltip
                styles={{
                  tooltip: {
                    whiteSpace: 'pre-line',
                    fontSize: 14,
                  },
                }}
                label={
                  <Text>
                    Wählen Sie die Versandart, für die diese Regel gelten soll.
                    {'\n'}Bei 'Egal' wird die Regel unabhängig von der Versandart angewendet.
                  </Text>
                }
              >
                <IconHelp size={20} style={{ color: '#0563C1' }} />
              </Tooltip>
            </Group>
            <Box
              p="xs"
              style={{
                border: '1px solid #d3dce6',
                borderRadius: 8,
                width: '100%'
              }}
            >
              <Radio.Group 
                value={formData.shippingType || 'Egal'} 
                onChange={(value) => handleChange("shippingType", value as ShippingType)}
              >
                <div style={{ display: 'flex', width: '100%' }}>
                 <Group style={{ width: '33.33%' }} >
                    <Radio
                      value="Egal"
                      label="Egal"
                      styles={{
                        label: { fontSize: 18 },
                        
                      }}
                    />
                  </Group>
                  <Group style={{ width: '33.33%' }}>
                    <Divider orientation="vertical" style={{ height: 24 }} />
                    <Radio
                      value="Paket"
                      label="Paket"
                      styles={{
                        label: { fontSize: 18 },
                      }}
                      
                    />
                  </Group>
                  <Group style={{ width: '33.33%' }} >
                    <Divider orientation="vertical" style={{ height: 24 }} />
                    <Radio
                      value="Spedition"
                      label="Spedition"
                      styles={{
                        label: { fontSize: 18 },
                      }}
                    />
                  </Group>
                 
                </div>
              </Radio.Group>
            </Box>
          </div>
          
          {/* Originalverpackt? */}
          <div>
            <Group gap="xs" mb={5}>
              <Text style={{ fontSize: 20 }}>Originalverpackt?</Text>
              <Tooltip
                styles={{
                  tooltip: {
                    whiteSpace: 'pre-line',
                    fontSize: 14,
                  },
                }}
                label={
                  <Text>
                    Legen Sie fest, ob die Regel nur für originalverpackte Artikel, nur für geöffnete Artikel oder für beide Fälle gelten soll.
                    {'\n'}Bei 'Egal' wird die Regel unabhängig vom Verpackungszustand angewendet.
                  </Text>
                }
              >
                <IconHelp size={20} style={{ color: '#0563C1' }} />
              </Tooltip>
            </Group>
            <Box
              p="xs"
              style={{
                border: '1px solid #d3dce6',
                borderRadius: 8,
                width: '100%'
              }}
            >
              <Radio.Group 
                value={formData.packageOpened || 'Egal'} 
                onChange={(value) => handleChange("packageOpened", value as 'yes' | 'no' | 'Egal')}
              >
                <div style={{ display: 'flex', width: '100%' }}>
                  <Group style={{ width: '33.33%' }} >
                    <Radio
                      value="Egal"
                      label="Egal"
                      styles={{
                        label: { fontSize: 18 },
                      }}
                    />
                  </Group>
                  <Group style={{ width: '33.33%' }}>
                    <Divider orientation="vertical" style={{ height: 24 }} />
                    <Radio
                      value="yes"
                      label="Ja"
                      styles={{
                        label: { fontSize: 18 },
                      }}
                    />
                  </Group>
                  <Group style={{ width: '33.33%' }} >
                    <Divider orientation="vertical" style={{ height: 24 }} />
                    <Radio
                      value="no"
                      label="Nein"
                      styles={{
                        label: { fontSize: 18 },
                      }}
                    />
                  </Group>
                </div>
              </Radio.Group>
            </Box>
          </div>

          {(!showCalculation || basicInfoChanged) && (
            <Group justify="flex-end">
              <MantineButton 
                onClick={validateRuleOverlap}
                variant="filled"
                color="blue"
                style={{ fontSize: 20, fontWeight: 400 }}
                rightSection={<IconArrowRight size={20} />}
                h={50}
              >
                Berechnung angeben
              </MantineButton>
            </Group>
          )}

          {validationError && (
            <MantineAlert color="red" variant="light" title="Überschneidung mit anderer Regel" icon={<IconAlertCircle size={20} />} styles={{
              message: {
                fontSize: '20px',
              },
              title: {
                fontSize: '20px',
              },
            }}>
              <Stack gap="xs">
                <Text style={{ fontSize: 18 }}>
                  Diese Regel überschneidet sich mit folgenden Regeln:
                </Text>
                <List style={{ fontSize: 18 }}>
                  {overlappingRules.map((rule) => (
                    <List.Item key={rule.id}>
                      <Text 
                        component="a" 
                        style={{ 
                          color: '#0563C1', 
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                        onClick={() => onSelectOverlappingRule(rule)}
                      >
                        {generateRuleName(rule)}
                      </Text>
                    </List.Item>
                  ))}
                </List>
              </Stack>
            </MantineAlert>
          )}
        </Stack>
      </Paper>
      
      {(showCalculation && !basicInfoChanged) && (
        <Paper p="md">
          <Stack gap="md">
            <div>
              <Text style={{ fontSize: 24 }}>Preisnachlassberechnung</Text>
            </div>

            {formData.hasMultipleStages ? (
              <Stack gap="md">
                {(formData.calculationStages || []).map((stage, index) => (
                  <Paper key={index} p="md" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text style={{ fontSize: 20 }}>Stufe {index + 1}</Text>
                        {index > 0 && (
                          <MantineButton
                            variant="subtle"
                            color="blue"
                            onClick={() => handleRemoveCalculationStage(index)}
                            style={{ fontSize: 18, fontWeight: 400 }}
                          >
                            Stufe löschen
                          </MantineButton>
                        )}
                      </Group>
                      
              <div>
                        <Group gap="xs" mb={5}>
                          <Text style={{ fontSize: 20 }}>Art der Berechnung</Text>
                          <Tooltip
                            styles={{
                              tooltip: {
                                whiteSpace: 'pre-line',
                                fontSize: 14,
                              },
                            }}
                            label={
                              <Text>
                                Wählen Sie die Methode zur Berechnung des Preisnachlasses:
                                {'\n'}- Prozent vom Verkaufspreis: Nachlass wird als Prozentsatz des Artikelpreises berechnet
                                {'\n'}- Fester Betrag: Ein fester Euro-Betrag wird abgezogen
                                {'\n'}- Preisstaffelung: Nachlass variiert je nach Artikelpreis
                              </Text>
                            }
                          >
                            <IconHelp size={20} style={{ color: '#0563C1' }} />
                          </Tooltip>
                        </Group>
                        <MantineSelect
                          value={stage.calculationBase}
                          onChange={(value) => handleCalculationStageChange(index, "calculationBase", value as CalculationBase)}
                          data={[
                            { value: 'prozent_vom_vk', label: getCalculationBaseLabel('prozent_vom_vk') },
                            { value: 'fester_betrag', label: getCalculationBaseLabel('fester_betrag') },
                            { value: 'preisstaffel', label: getCalculationBaseLabel('preisstaffel') }
                          ]}
                          styles={{ input: { fontSize: 18 }, option: { fontSize: 18 } }}
                        />
                      </div>

                      {/* Stage-specific calculation fields */}
                      {renderCalculationFields(stage, index)}
                      
                    </Stack>
                  </Paper>
                ))}
                <MaximalbetragField
                          value={formData.maxAmount || ''}
                          onChange={(value) => handleChange("maxAmount", value)}
                        />
                <MantineButton 
                    type="button"
                  onClick={handleAddCalculationStage}
                    variant="outline" 
                  fullWidth
                  leftSection={<IconPlus size={16} />}
                  style={{ fontSize: 20, fontWeight: 400 }}
                  h={50}
                >
                  Preisnachlassstufe hinzufügen
                  <Tooltip
                    styles={{
                      tooltip: {
                        whiteSpace: 'pre-line', // Enables \n line breaks
                        fontSize: 14,
                      },
                    }}
                    label={
                      <Text>
                        Wenn Sie hier klicken, können Sie eine weitere Preisnachlassstufe hinzufügen. 
                        {'\n'}Die nächste Preisnachlassstufe wird dem Kunden dann gewährt, wenn der vorherige Preisnachlass vom Kunden abgelehnt wurde. 
                      </Text>
                    }
                  >
                    <IconHelp size={20} style={{ color: '#0563C1', marginLeft: 10 }} />
                  </Tooltip>
                </MantineButton>
              </Stack>
            ) : (
              <div className="space-y-4">
                      <div>
                  <Group gap="xs" mb={5}>
                    <Text style={{ fontSize: 20 }}>Art der Berechnung</Text>
                    <Tooltip
                      styles={{
                        tooltip: {
                          whiteSpace: 'pre-line',
                          fontSize: 14,
                        },
                      }}
                      label={
                        <Text>
                          Wählen Sie die Methode zur Berechnung des Preisnachlasses:
                          {'\n'}- Prozent vom Verkaufspreis: Nachlass wird als Prozentsatz des Artikelpreises berechnet
                          {'\n'}- Fester Betrag: Ein fester Euro-Betrag wird abgezogen
                          {'\n'}- Preisstaffelung: Nachlass variiert je nach Artikelpreis
                        </Text>
                      }
                    >
                      <IconHelp size={20} style={{ color: '#0563C1' }} />
                    </Tooltip>
                  </Group>
                  <Box
                    p="xs"
                    style={{
                      border: '1px solid #d3dce6',
                      borderRadius: 8,
                      width: '100%'
                    }}
                  >
                    <Radio.Group
                      value={formData.calculationBase}
                      onChange={(value) => {
                        const newValue = value as CalculationBase;
                        if (newValue === 'preisstaffel' && (!formData.priceThresholds || formData.priceThresholds.length === 0)) {
                          handleChange("priceThresholds", [{
                            minPrice: 0,
                            value: 10,
                            valueType: 'percent',
                            roundingRule: 'keine_rundung'
                          }]);
                        }
                        handleChange("calculationBase", newValue);
                      }}
                    >
                      <div style={{ display: 'flex', width: '100%' }}>
                        <Group style={{ width: '33.33%' }}>
                          <Radio
                            value="prozent_vom_vk"
                            label={getCalculationBaseLabel('prozent_vom_vk')}
                            styles={{
                              label: { fontSize: 18 }
                            }}
                          />
                        </Group>
                        <Group style={{ width: '33.33%' }}>
                          <Divider orientation="vertical" style={{ height: 24 }} />
                          <Radio
                            value="fester_betrag"
                            label={getCalculationBaseLabel('fester_betrag')}
                            styles={{
                              label: { fontSize: 18 }
                            }}
                          />
                        </Group>
                        <Group style={{ width: '33.33%' }}>
                          <Divider orientation="vertical" style={{ height: 24 }} />
                          <Radio
                            value="preisstaffel"
                            label={getCalculationBaseLabel('preisstaffel')}
                            styles={{
                              label: { fontSize: 18 }
                            }}
                          />
                        </Group>
                      </div>
                    </Radio.Group>
                  </Box>
                  </div>
                    
                {/* Single calculation fields */}
                {formData.calculationBase === 'prozent_vom_vk' && (
                  <CalculationField
                    type="prozent_vom_vk"
                    value={formData.value || 0}
                    onChange={(value) => handleChange("value", value)}
                    roundingRule={formData.roundingRule}
                    onRoundingRuleChange={(value) => handleChange("roundingRule", value)}
                    roundingRules={roundingRules}
                    maxAmount={formData.maxAmount || ''}
                    onMaxAmountChange={(value) => handleChange("maxAmount", value)}
                    hasMultipleStages={formData.hasMultipleStages}
                  />
                )}

                {formData.calculationBase === 'fester_betrag' && (
                  <CalculationField
                    type="fester_betrag"
                    value={formData.value || 0}
                    onChange={(value) => handleChange("value", value)}
                    maxAmount={formData.maxAmount || ''}
                    onMaxAmountChange={(value) => handleChange("maxAmount", value)}
                    hasMultipleStages={formData.hasMultipleStages}
                  />
                )}

                {formData.calculationBase === 'preisstaffel' && (
                  <PriceThresholdSection
                    priceThresholds={formData.priceThresholds}
                    onRemove={(index) => handleRemovePriceThreshold(0, index)}
                    onChange={(index, field, value) => handlePriceThresholdChange(0, index, field, value)}
                    roundingRules={roundingRules}
                    stageIndex={0}
                    maxAmount={formData.maxAmount || ''}
                    onMaxAmountChange={(value) => handleChange("maxAmount", value)}
                  />
                )}

                <MantineButton
                  type="button"
                  onClick={handleConvertToMultiStage}
                  variant="outline"
                  fullWidth
                  leftSection={<IconPlus size={16} />}
                  style={{ fontSize: 20, fontWeight: 400 }}
                  h={50}
                  mt="md"
                >
                  Preisnachlassstufe hinzufügen
                  <Tooltip
                    styles={{
                      tooltip: {
                        whiteSpace: 'pre-line', // Enables \n line breaks
                        fontSize: 14,
                      },
                    }}
                    label={
                      <Text>
                        Wenn Sie hier klicken, können Sie eine weitere Preisnachlassstufe hinzufügen. 
                        {'\n'}Die nächste Preisnachlassstufe wird dem Kunden dann gewährt, wenn der vorherige Preisnachlass vom Kunden abgelehnt wurde. 
                      </Text>
                    }
                  >
                    <IconHelp size={20} style={{ color: '#0563C1', marginLeft: 10 }} />
                  </Tooltip>
                </MantineButton>
              </div>
            )}
          </Stack>
        </Paper>
      )}
      
      {(showCalculation && !basicInfoChanged) && (
        <Paper p="md">
          <Stack gap="md">
            <div className="space-y-4">
              <Group>
                <MantineCheckbox 
                  checked={formData.consultPartnerBeforePayout || false}
                  onChange={(event) => handleChange("consultPartnerBeforePayout", event.currentTarget.checked)}
                />
                <Text style={{ fontSize: 20 }}>
                Preisnachlass-Auszahlung nur nach vorheriger Abstimmung per E-Mail.
                </Text>
                {formData.consultPartnerBeforePayout && (
                  <Alert color="blue" 
                    icon={<IconInfoCircle size={20} />} 
                    title="Hinweis"
                    styles={{
                      message: {
                        fontSize: '20px',
                      },
                      title: {
                        fontSize: '20px',
                      },
                    }}>
                    Wenn keine Rückmeldung zu einer Preisnachlass Anfrage innerhalb von 2 Werktagen erfolgt, wird der Preisnachlass automatisch gewährt.
                  </Alert>
                )}
              </Group>
              
            </div>
          
            <div>
              <Text style={{ fontSize: 20 }} mb={5}>Notizen</Text>
              <MantineTextarea 
                value={formData.notes || ''} 
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Zusätzliche Hinweise zur Regel"
                minRows={4}
                styles={{ input: { fontSize: 18 }}}
              />
            </div>
          </Stack>
        </Paper>
      )}

      {showCalculation && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text style={{ fontSize: 24 }}>Beispielberechnung</Text>
            
            <Group grow>
              {[100, 250, 500].map((price) => (
                <Paper key={price} p="md" withBorder>
                  <Stack gap="xs">
                    <Text style={{ fontSize: 18 }}>Verkaufspreis: {price}€</Text>
                    {getAllRefunds(price).map((refund, index) => (
                      <Group key={index} justify="space-between">
                        <Text style={{ fontSize: 18 }}>
                          {formData.hasMultipleStages ? `Stufe ${index + 1}:` : 'Nachlass:'}
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: 500, color: '#0563C1' }}>
                          {refund.toFixed(2)}€
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Add extra padding to the bottom of the form so content is not hidden behind the button */}
      <div style={{ height: 80 }} />

      {/* Sticky Save Button */}
      {(!basicInfoChanged && (showCalculation || rule)) && (
        <div
          style={{
            position: 'fixed',
            left: formRect.left,
            width: formRect.width,
            bottom: 0,
            zIndex: 100,
            padding: '16px 0',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'center',
            transition: 'left 0.2s, width 0.2s',
          }}
        >
          <MantineButton
            type="submit"
            leftSection={<IconDeviceFloppy size={20} />}
            size="lg"
            color="blue"
            style={{ width: '90%', fontSize: 20, fontWeight: 400 }}
            h={50}
          >
            Speichern
          </MantineButton>
          </div>
      )}
    </form>
  );
};

export default RuleForm;
