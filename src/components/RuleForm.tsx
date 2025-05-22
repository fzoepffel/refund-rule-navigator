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
} from "../utils/discountUtils";
import { IconArrowLeft, IconPlus, IconMinus, IconDeviceFloppy, IconAlertCircle, IconArrowRight } from '@tabler/icons-react';
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
  Alert as MantineAlert
} from '@mantine/core';

interface RuleFormProps {
  rule?: DiscountRule;
  existingRules: DiscountRule[];
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
}

interface FormData {
  ruleName: string;
  triggers: string[];
  priceThreshold: number;
  partnerConsultation: boolean;
}

const defaultRule: DiscountRule = {
  id: "",
  name: "",
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
      <Text style={{ fontSize: 20 }} mb={5}>Rundungsregel</Text>
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
interface MaxAmountInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  label?: string;
  description?: string;
  className?: string;
}

const MaxAmountInput: React.FC<MaxAmountInputProps> = ({
  value,
  onChange,
  label = "Maximalbetrag",
  description = "Maximaler Betrag für den Preisnachlass",
  className
}) => {
  return (
    <div className={className}>
      <Text style={{ fontSize: 20 }} mb={5}>{label}</Text>
      <NumberInput
        value={value}
        onChange={onChange}
        min={0}
        rightSection={<Text>€</Text>}
        rightSectionWidth={30}
        styles={{ input: { fontSize: 18 } }}
      />
      <Text style={{fontSize: 14}} c="dimmed" mt={5}>
        {description}
      </Text>
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
}

const CalculationField: React.FC<CalculationFieldProps> = ({
  type,
  value,
  onChange,
  roundingRule,
  onRoundingRuleChange,
  roundingRules
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Text style={{ fontSize: 20 }} mb={5}>
          {type === 'prozent_vom_vk' ? 'Prozentsatz' : 'Betrag (€)'}
        </Text>
        <NumberInput
          value={value || 0}
          onChange={onChange}
          min={0}
          max={type === 'prozent_vom_vk' ? 100 : undefined}
          rightSection={<Text>{type === 'prozent_vom_vk' ? '%' : '€'}</Text>}
          rightSectionWidth={30}
          styles={{ input: { fontSize: 18 } }}
        />
      </div>
      {type === 'prozent_vom_vk' && roundingRule && onRoundingRuleChange && roundingRules && (
        <RoundingRuleSelect
          value={roundingRule}
          onChange={onRoundingRuleChange}
          roundingRules={roundingRules}
        />
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
}

const PriceThresholdSection: React.FC<PriceThresholdSectionProps> = ({
  priceThresholds,
  onRemove,
  onChange,
  roundingRules,
  stageIndex
}) => {
  return (
    <div className="space-y-4">
      <Text style={{fontSize: 20}}>Preisstaffelung</Text>
      
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
    </div>
  );
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, existingRules, onSave, onCancel }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formRect, setFormRect] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Update the getInitialFormData function
  const getInitialFormData = () => {
    if (rule) {
      // When editing, return the rule without the name
      return {
        ...rule,
        name: ''
      };
    }
    // Create a deep copy of the default rule
    return JSON.parse(JSON.stringify(defaultRule));
  };

  const [formData, setFormData] = useState<DiscountRule>(getInitialFormData());
  
  // Update the useEffect to handle the initial form data
  useEffect(() => {
    if (rule) {
      // When editing, set form data without the name
      setFormData({
        ...rule,
        name: ''
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

  // Add state to track if basic info has been changed
  const [basicInfoChanged, setBasicInfoChanged] = useState(false);

  // Update the effect to handle both new and existing rules
  useEffect(() => {
    // Only hide calculation section if a basic info field is changed after initial load
    if (basicInfoChanged) {
      setShowCalculation(false);
    }
    setValidationError(null);
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
    const hasOverlap = rulesToCheck.some(existingRule => {
      // Check if shipping types overlap
      const shippingTypeOverlap = doShippingTypesOverlap(formData.shippingType, existingRule.shippingType);

      // Check if package opened status overlaps
      const packageOpenedOverlap = doPackageOpenedOverlap(formData.packageOpened, existingRule.packageOpened);

      // Check if triggers overlap
      const triggerOverlap = doTriggersOverlap(formData.triggers, existingRule.triggers);

      // If all conditions overlap, there's a conflict
      return shippingTypeOverlap && packageOpenedOverlap && triggerOverlap;
    });

    if (hasOverlap) {
      setValidationError("Diese Regel überschneidet sich mit einer bestehenden Regel. Bitte passen Sie die Grundinformationen an.");
      setShowCalculation(false);
    } else {
      setValidationError(null);
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
  
  // Generate rule name according to new schema
  const generateRuleName = () => {
    if (formData.name) return formData.name;
    
    const parts: string[] = [];

    // Part 1: Main triggers (Geschmacksretoure/Mangel)
    const mainSelectedTriggers = formData.triggers.filter(t => mainTriggers.includes(t));
    
    // Check if all Mangel triggers are selected
    const allMangelTriggersSelected = mangelTriggers.every(trigger => formData.triggers.includes(trigger));
    
    // If all Mangel triggers are selected, show "Mangel" instead of individual triggers
    if (allMangelTriggersSelected) {
      const triggersWithoutMangel = mainSelectedTriggers.filter(t => t !== 'Mangel');
      if (triggersWithoutMangel.length > 0) {
        parts.push(triggersWithoutMangel.join(", "));
      }
      parts.push("Mangel");
    } else {
      // Otherwise, show only the specific triggers that are selected
      const specificTriggers = formData.triggers.filter(t => t !== 'Mangel');
      if (specificTriggers.length > 0) {
        parts.push(specificTriggers.join(", "));
      }
    }

    // Part 2: Versandart
    if (formData.shippingType !== "Egal") {
      parts.push(formData.shippingType);
    } 

    // Part 3: Originalverpackt
    if (formData.packageOpened === "yes") {
      parts.push("originalverpackt");
    } else if (formData.packageOpened === "no") {
      parts.push("nicht originalverpackt");
    }

    return parts.filter(part => part).join(", ");
  };
  
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
    
    // Generate name if empty before saving
    const finalData = {
      ...formData,
      name: generateRuleName(),
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
          />
        );
      case 'fester_betrag':
        return (
          <CalculationField
            type="fester_betrag"
            value={stage.value || 0}
            onChange={(value) => handleCalculationStageChange(stageIndex, 'value', value)}
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
    setFormData(prev => ({
      ...prev,
      calculationStages: prev.calculationStages?.filter((_, i) => i !== index)
    }));
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
            <Text style={{ fontSize: 24 }}>Grundinformationen zum Regelfall</Text>
            <Text style={{fontSize: 18}}>
              Hier wird der Fall definiert, für welchen diese Preisnachlassregel erstellt werden soll. Jeder Merchant kann eine beliebige Anzahl an Regeln zu einer beliebigen Anzahl an Fällen definieren. Wird in einem der Menüs "Egal" ausgewählt, so wird die Regel für alle Fälle gelten, sofern nicht anders definiert.
            </Text>
          </div>
      
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Regelname (optional)</Text>
            <TextInput 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder={generateRuleName()}
              styles={{
                input: {
                  fontSize: '20px', // Change this value as needed
                }
              }}
            />
            <Text style={{fontSize: 14}} c="dimmed" mt={5}>
              Leer lassen für automatisch generierten Namen: {generateRuleName()}
            </Text>
          </div>
          
          {/* Gründe */}
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Gründe</Text>
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
              </Group>
              <Text style={{fontSize: 14}} c="dimmed">
                Geschmacksretoure entspricht Widerruf und Mangel entspricht Reklamation. Für Widerruf und Reklamation einfach beide auswählen. Für speziellere Mängel kann zudem ein sekundärer Mangelgrund ausgewählt werden.
              </Text>

              {formData.triggers.includes('Mangel') && (
                <Box pl="md" style={{ borderLeft: '2px solid #0563C1' }}>
                  <MultiSelect
                    label="Spezifische Mängel"
                    styles={{ label: { fontSize: 20, fontWeight: 400 }, input: { fontSize: 18 }, pill: { fontSize: 18, backgroundColor: 'white' }, option: { fontSize: 18 }}}
                    placeholder="Spezifische Mängel auswählen"
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
            <Text style={{ fontSize: 20 }} mb={5}>Versandart</Text>
            <MantineSelect
              value={formData.shippingType || 'Egal'} 
              onChange={(value) => handleChange("shippingType", value as ShippingType)}
              data={shippingTypes.map(type => ({ value: type, label: type }))}
              placeholder="Versandart auswählen"
              styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
            />
          </div>
          
          {/* Originalverpackt? */}
          <div>
            <Text style={{ fontSize: 20 }} mb={5}>Originalverpackt?</Text>
            <MantineSelect
              value={formData.packageOpened || 'Egal'} 
              onChange={(value) => handleChange("packageOpened", value as 'yes' | 'no' | 'Egal')}
              data={[
                { value: 'Egal', label: 'Egal' },
                { value: 'yes', label: 'Ja' },
                { value: 'no', label: 'Nein' }
              ]}
              placeholder="Bitte auswählen"
              styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
            />
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
            <MantineAlert color="red" variant="light" title="Überlappung mit anderer Regel" icon={<IconAlertCircle size={20} />} styles={{
              message: {
                fontSize: '20px', // Adjust to your desired size
              },
              title: {
                fontSize: '20px', // Adjust to your desired size
              },
            }}>
              {validationError}
            </MantineAlert>
          )}
        </Stack>
      </Paper>
      
      {(showCalculation && !basicInfoChanged) && (
        <Paper p="md">
          <Stack gap="md">
            <div>
              <Text style={{ fontSize: 24 }}>Berechnungsgrundlage</Text>
              <Text style={{fontSize: 18}}>
                Soll ein Preisnachlass im gegebenen Regelfall und bei der gewählten Strategie gewährt werden, wird hier definiert, wie dieser berechnet wird.
              </Text>
            </div>

            <div className="space-y-2">
              <Group>
                <MantineCheckbox
                  checked={formData.hasMultipleStages}
                  onChange={(event) => handleChange("hasMultipleStages", event.currentTarget.checked)}
                />
                <Text style={{ fontSize: 20 }}>Mehrere Angebotsstufen</Text>
              </Group>
              <Text style={{fontSize: 14}} c="dimmed" pl={40}>
                Wird hier ein Haken gesetzt, können Preisnachlässe in mehreren Stufen definiert werden. 
                Dem Kunden wird Schritt für Schritt die nächsthöhere Angebotsstufe angeboten.
              </Text>
            </div>

            {formData.hasMultipleStages ? (
              <Stack gap="md">
                {(formData.calculationStages || []).map((stage, index) => (
                  <Paper key={index} p="md" withBorder>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text fw={500}>Stufe {index + 1}</Text>
                        {index > 0 && (
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => handleRemoveCalculationStage(index)}
                          >
                            <IconMinus size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                      
              <div>
                        <Text style={{ fontSize: 20 }} mb={5}>Art der Berechnung</Text>
                        <MantineSelect
                          value={stage.calculationBase}
                          onChange={(value) => handleCalculationStageChange(index, "calculationBase", value as CalculationBase)}
                          data={calculationBases.map(base => ({
                            value: base,
                            label: getCalculationBaseLabel(base)
                          }))}
                          styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
                        />
                  </div>

                      {/* Stage-specific calculation fields */}
                      {renderCalculationFields(stage, index)}
                    </Stack>
                  </Paper>
                ))}

                <MantineButton 
                    type="button" 
                  onClick={handleAddCalculationStage}
                    variant="outline" 
                  fullWidth
                  leftSection={<IconPlus size={16} />}
                  style={{ fontSize: 20, fontWeight: 400 }}
                  h={50}
                >
                  Stufe hinzufügen
                </MantineButton>

                <MaxAmountInput
                  value={formData.maxAmount || ''}
                  onChange={(value) => handleChange("maxAmount", value)}
                  description="Maximaler Betrag für den Preisnachlass"
                />
              </Stack>
            ) : (
              <div className="space-y-4">
                      <div>
                  <Text style={{ fontSize: 20 }} mb={5}>Art der Berechnung</Text>
                  <MantineSelect 
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
                    data={calculationBases.map(base => ({
                      value: base,
                      label: getCalculationBaseLabel(base)
                    }))}
                    styles={{ input: { fontSize: 18 }, option: { fontSize: 18 }}}
                  />
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
                  />
                )}

                {formData.calculationBase === 'fester_betrag' && (
                  <CalculationField
                    type="fester_betrag"
                    value={formData.value || 0}
                    onChange={(value) => handleChange("value", value)}
                  />
                )}

                {formData.calculationBase === 'preisstaffel' && (
                  <PriceThresholdSection
                    priceThresholds={formData.priceThresholds}
                    onRemove={(index) => handleRemovePriceThreshold(0, index)}
                    onChange={(index, field, value) => handlePriceThresholdChange(0, index, field, value)}
                    roundingRules={roundingRules}
                    stageIndex={0}
                  />
                )}

                {(formData.calculationBase === 'prozent_vom_vk' || formData.calculationBase === 'preisstaffel') && (
                  <MaxAmountInput
                value={formData.maxAmount || ''} 
                    onChange={(value) => handleChange("maxAmount", value)}
                    description="Maximaler Betrag für den Preisnachlass"
                  />
                )}
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
                  Rücksprache mit Partner vor Auszahlung
                </Text>
                <Text style={{fontSize: 18}}>
                Wenn keine Rückmeldung zu einer Preisnachlass Anfrage innerhalb von 2 Werktagen erfolgt wird der Preisnachlassautomatisch gewährt
              </Text>
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
