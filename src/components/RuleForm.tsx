import React, { useState, useEffect } from "react";
import { 
  Trigger, 
  RequestType,
  RequestCategory,
  CalculationBase, 
  RoundingRule, 
  ReturnHandling,
  ThresholdValueType,
  PriceThreshold,
  ShippingType,
  DiscountLevel,
  CustomerOption
} from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getReturnHandlingLabel,
  getThresholdValueTypeLabel
} from "../utils/discountUtils";
import { sampleRules } from "../data/sampleRules";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconPlus, IconMinus, IconDeviceFloppy } from '@tabler/icons-react';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert } from "@/components/ui/alert";
import { Chip } from '@mantine/core';
import { 
  Paper, 
  TextInput, 
  NumberInput, 
  Switch, 
  Divider, 
  ActionIcon, 
  Tooltip,
  Select as MantineSelect,
  Button as MantineButton,
  Text,
  Group,
  Stack,
  Checkbox as MantineCheckbox,
  Textarea as MantineTextarea,
  Title,
  Container,
  MultiSelect,
  Badge,
  Box,
  Flex,
  Radio
} from '@mantine/core';
import { Plus } from 'lucide-react';

interface RuleFormProps {
  rule?: DiscountRule;
  existingRules: DiscountRule[];
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
}

interface DiscountRule {
  id: string;
  name: string;
  requestType: RequestType;
  requestCategory: RequestCategory[];
  triggers: Trigger[];
  calculationBase: CalculationBase;
  roundingRule: RoundingRule;
  returnHandling: ReturnHandling;
  shippingType: ShippingType;
  packageOpened: 'yes' | 'no' | 'Egal';
  value: number;
  isCompleteRule?: boolean;
  consultPartnerBeforePayout: boolean;
  hasMultipleStages?: boolean;
  calculationStages?: {
    calculationBase: CalculationBase;
    value?: number;
    priceThresholds?: PriceThreshold[];
    roundingRule?: RoundingRule;
  }[];
  priceThresholds?: PriceThreshold[];
  discountLevels?: DiscountLevel[];
  maxAmount?: number;
  previousRefundsCheck?: boolean;
  customerLoyaltyCheck?: boolean;
  minOrderAgeToDays?: number;
  notes?: string;
  requestPictures?: boolean;
  customerOptions?: CustomerOption[];
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
  requestType: "Egal",
  requestCategory: [] as RequestCategory[],
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
  returnHandling: "keine_retoure",
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
  customerOptions: ['Preisnachlass']
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, existingRules, onSave, onCancel }) => {
  // Create a fresh copy of the default rule for new rules
  const getInitialFormData = () => {
    if (rule) {
      return rule;
    }
    // Create a deep copy of the default rule
    return JSON.parse(JSON.stringify(defaultRule));
  };

  const [formData, setFormData] = useState<DiscountRule>(getInitialFormData());
  
  // Initialize form data with existing rule when editing
  useEffect(() => {
    if (rule) {
      setFormData(rule);
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
  
  const calculationBases: CalculationBase[] = ['keine_berechnung', 'prozent_vom_vk', 'fester_betrag', 'preisstaffel'];
  const roundingRules: RoundingRule[] = ['keine_rundung', 'auf_5_euro', 'auf_10_euro', 'auf_1_euro'];
  const returnHandlings: ReturnHandling[] = ['automatisches_label', 'manuelles_label', 'zweitverwerter', 'keine_retoure'];
  const thresholdValueTypes: ThresholdValueType[] = ['percent', 'fixed'];
  const shippingTypes: ShippingType[] = ['Egal', 'Paket', 'Spedition'];
  
  // Add new state for validation
  const [showCalculation, setShowCalculation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Add effect to hide calculation section when basic info changes
  useEffect(() => {
    if (!rule) {  // Only apply this behavior for new rules
      setShowCalculation(false);
      setValidationError(null);
    }
  }, [formData.triggers, formData.shippingType, formData.packageOpened]);

  // Update validation function
  const validateRuleOverlap = () => {
    // Skip validation if we're editing an existing rule
    if (rule) {
      setShowCalculation(true);
      return;
    }

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
  
  // Effect for handling rule completeness and consultation checkbox relationship
  useEffect(() => {
    // If rule is not complete, partner consultation is required
    if (formData.isCompleteRule === false) {
      setFormData(prev => ({
        ...prev,
        consultPartnerBeforePayout: true
      }));
    }
    // If rule is complete, remove partner consultation requirement (unless calculation base requires it)
    else if (formData.isCompleteRule === true && formData.calculationBase !== 'keine_berechnung') {
      setFormData(prev => ({
        ...prev,
        consultPartnerBeforePayout: false
      }));
    }
  }, [formData.isCompleteRule]);
  
  const handleChange = (field: keyof DiscountRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
  
  const renderDiscountLevelsSection = () => {
    if (formData.calculationBase !== 'angebotsstaffel') return null;
    
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>Angebotsabfolge</Text>
          <MantineButton 
            variant="outline" 
            size="sm" 
            onClick={handleAddDiscountLevel}
            leftSection={<IconPlus size={16} />}
          >
            Stufe hinzufügen
          </MantineButton>
        </Group>
        
        {(formData.discountLevels || []).map((level, index) => (
          <Paper key={index} p="md" withBorder>
            <Group grow>
              <Group>
                <NumberInput
                  value={level.value}
                  onChange={(value) => handleDiscountLevelChange(index, "value", value)}
                  min={1}
                  w={100}
                />
                <MantineSelect
                  value={level.valueType}
                  onChange={(value) => handleDiscountLevelChange(index, "valueType", value as ThresholdValueType)}
                  data={[
                    { value: 'percent', label: '%' },
                    { value: 'fixed', label: '€' }
                  ]}
                  w={80}
                />
                
                {index < (formData.discountLevels?.length || 0) - 1 && (
                  <Text>→</Text>
                )}
              </Group>
              
              <MantineSelect
                value={level.roundingRule}
                onChange={(value) => handleDiscountLevelChange(index, "roundingRule", value as RoundingRule)}
                data={roundingRules.map(rule => ({
                  value: rule,
                  label: getRoundingRuleLabel(rule)
                }))}
              />
              
              <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  disabled={formData.discountLevels?.length === 1}
                  onClick={() => handleRemoveDiscountLevel(index)}
                >
                  <IconMinus size={16} />
                </ActionIcon>
              </Box>
            </Group>
          </Paper>
        ))}
        
        {(!formData.discountLevels || formData.discountLevels.length === 0) && (
          <MantineButton 
            variant="outline" 
            onClick={handleAddDiscountLevel}
            leftSection={<IconPlus size={16} />}
          >
            Erste Stufe hinzufügen
          </MantineButton>
        )}
      </Stack>
    );
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
          <div className="space-y-4">
            <div>
              <Text size="sm" fw={500} mb={5}>Prozentsatz</Text>
              <NumberInput
                value={stage.value || 0}
                onChange={(value) => handleCalculationStageChange(stageIndex, 'value', value)}
                min={0}
                max={100}
                rightSection={<Text>%</Text>}
                rightSectionWidth={30}
              />
            </div>
            <div>
              <Text size="sm" fw={500} mb={5}>Rundungsregel</Text>
              <MantineSelect
                value={stage.roundingRule}
                onChange={(value) => handleCalculationStageChange(stageIndex, 'roundingRule', value as RoundingRule)}
                data={roundingRules.map(rule => ({
                  value: rule,
                  label: getRoundingRuleLabel(rule)
                }))}
              />
            </div>
          </div>
        );
      case 'fester_betrag':
        return (
          <div className="space-y-4">
            <div>
              <Text size="sm" fw={500} mb={5}>Betrag</Text>
              <NumberInput
                value={stage.value || 0}
                onChange={(value) => handleCalculationStageChange(stageIndex, 'value', value)}
                min={0}
                rightSection={<Text>€</Text>}
                rightSectionWidth={30}
              />
            </div>
          </div>
        );
      case 'preisstaffel':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text size="sm" fw={500}>Preisstaffelung</Text>
            </div>
            
            {(priceThresholds || []).map((threshold, index) => (
              <Paper key={index} p="md" withBorder>
                <Stack gap="md">
                  <Group grow>
                    <div>
                      <Text size="sm" fw={500} mb={5}>Min (€)</Text>
                      <NumberInput
                        value={threshold.minPrice}
                        disabled
                        styles={{ input: { backgroundColor: 'var(--mantine-color-gray-1)' } }}
                      />
                    </div>
                    <div>
                      <Text size="sm" fw={500} mb={5}>Max (€)</Text>
                      <NumberInput
                        value={threshold.maxPrice || undefined}
                        onChange={(value) => handlePriceThresholdChange(stageIndex, index, 'maxPrice', value)}
                        min={threshold.minPrice + 1}
                        placeholder={index === (priceThresholds?.length || 0) - 1 ? "Unbegrenzt" : ""}
                      />
                    </div>
                    <div>
                      <Text size="sm" fw={500} mb={5}>Wert</Text>
                      <NumberInput
                        value={threshold.value}
                        onChange={(value) => handlePriceThresholdChange(stageIndex, index, 'value', value)}
                        min={0}
                      />
                    </div>
                    <div>
                      <Text size="sm" fw={500} mb={5}>Art</Text>
                      <MantineSelect
                        value={threshold.valueType || 'percent'}
                        onChange={(value) => handlePriceThresholdChange(stageIndex, index, 'valueType', value as ThresholdValueType)}
                        data={[
                          { value: 'percent', label: '%' },
                          { value: 'fixed', label: '€' }
                        ]}
                      />
                    </div>
                    <div>
                      <Text size="sm" fw={500} mb={5}>Rundungsregel</Text>
                      <MantineSelect
                        value={threshold.roundingRule}
                        onChange={(value) => handlePriceThresholdChange(stageIndex, index, 'roundingRule', value as RoundingRule)}
                        data={roundingRules.map(rule => ({
                          value: rule,
                          label: getRoundingRuleLabel(rule)
                        }))}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="lg"
                        disabled={priceThresholds?.length === 1}
                        onClick={() => handleRemovePriceThreshold(stageIndex, index)}
                      >
                        <IconMinus size={16} />
                      </ActionIcon>
                    </div>
                  </Group>

                  <Group>
                    <MantineCheckbox
                      checked={threshold.consultPartnerBeforePayout || false}
                      onChange={(event) => 
                        handlePriceThresholdChange(stageIndex, index, 'consultPartnerBeforePayout', event.currentTarget.checked)
                      }
                    />
                    <Text size="sm">
                      Vor Auszahlung Merchant kontaktieren
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </div>
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Group>
        <MantineButton type="button" variant="outline" size="sm" onClick={onCancel}>
          <IconArrowLeft className="h-4 w-4" />
        </MantineButton>
        <Title order={2} style={{ flex: 1 }}>
          {rule ? "Regel bearbeiten" : "Neue Regel erstellen"}
        </Title>
        <MantineButton type="submit" leftSection={<IconDeviceFloppy size={16} />}>
          Speichern
        </MantineButton>
      </Group>
      
      <Paper p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>Grundinformationen zum Regelfall</Title>
            <Text size="sm" c="dimmed">
              Hier wird der Fall definiert, für welchen diese Preisnachlassregel erstellt werden soll. Jeder Merchant kann eine beliebige Anzahl an Regeln zu einer beliebigen Anzahl an Fällen definieren. Wird in einem der Menüs "Egal" ausgewählt, so wird die Regel für alle Fälle gelten, sofern nicht anders definiert.
            </Text>
          </div>

          <div>
            <Text size="sm" fw={500} mb={5}>Regelname (optional)</Text>
            <TextInput 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder={generateRuleName()}
            />
            <Text size="xs" c="dimmed" mt={5}>
              Leer lassen für automatisch generierten Namen: {generateRuleName()}
            </Text>
          </div>
          
          {/* Gründe */}
          <div>
            <Text size="sm" fw={500} mb={5}>Gründe</Text>
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
                      color={isMangel && someMangelTriggersSelected && !allMangelTriggersSelected ? "blue" : undefined}
                    >
                      {getTriggerLabel(trigger)}
                    </Chip>
                  );
                })}
              </Group>
              <Text size="xs" c="dimmed">
                Geschmacksretoure entspricht Widerruf und Mangel entspricht Reklamation. Für Widerruf und Reklamation einfach beide auswählen. Für speziellere Mängel kann zudem ein sekundärer Mangelgrund ausgewählt werden.
              </Text>

              {formData.triggers.includes('Mangel') && (
                <Box pl="md" style={{ borderLeft: '2px solid var(--mantine-color-blue-2)' }}>
                  <MultiSelect
                    label="Spezifische Mängel"
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
                      setFormData(prev => ({
                        ...prev,
                        triggers: [...newTriggers, ...(values as Trigger[])]
                      }));
                    }}
                    searchable
                    clearable
                    color="blue"
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Für generelle Mängel (Reklamationen) einfach alle Spezifischen Mängel ausgewählt lassen.
                  </Text>
                </Box>
              )}
            </Stack>
          </div>

          {/* Versandart */}
          <div>
            <Text size="sm" fw={500} mb={5}>Versandart</Text>
            <MantineSelect
              value={formData.shippingType || 'Egal'}
              onChange={(value) => handleChange("shippingType", value as ShippingType)}
              data={shippingTypes.map(type => ({ value: type, label: type }))}
              placeholder="Versandart auswählen"
            />
          </div>
          
          {/* Originalverpackt? */}
          <div>
            <Text size="sm" fw={500} mb={5}>Originalverpackt?</Text>
            <MantineSelect
              value={formData.packageOpened || 'Egal'}
              onChange={(value) => handleChange("packageOpened", value as 'yes' | 'no' | 'Egal')}
              data={[
                { value: 'Egal', label: 'Egal' },
                { value: 'yes', label: 'Ja' },
                { value: 'no', label: 'Nein' }
              ]}
              placeholder="Bitte auswählen"
            />
          </div>

          {!rule && (
            <Group justify="flex-end">
              <MantineButton 
                onClick={validateRuleOverlap}
                variant="filled"
                color="blue"
              >
                Berechnung angeben
              </MantineButton>
            </Group>
          )}

          {validationError && (
            <Alert variant="destructive" className="mt-4">
              <Text c="red.6">{validationError}</Text>
            </Alert>
          )}
        </Stack>
      </Paper>
      
      {(showCalculation || rule) && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3}>Berechnungsgrundlage</Title>
              <Text size="sm" c="dimmed">
                Soll ein Preisnachlass im gegebenen Regelfall und bei der gewählten Strategie gewährt werden, wird hier definiert, wie dieser berechnet wird.
              </Text>
            </div>

            <div className="space-y-2">
              <Group>
                <MantineCheckbox
                  checked={formData.hasMultipleStages}
                  onChange={(event) => handleChange("hasMultipleStages", event.currentTarget.checked)}
                />
                <Text size="sm" fw={500}>Mehrere Angebotsstufen</Text>
              </Group>
              <Text size="xs" c="dimmed" pl={40}>
                Wird hier ein Haken gesetzt, können Preisnachlässe in mehreren Stufen definiert werden. 
                Dem Kunden wird Schritt für Schritt die nächsthöhere Angebotsstufe angeboten bevor der finale Ablehnungsfall eintritt.
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
                        <Text size="sm" fw={500} mb={5}>Art der Berechnung</Text>
                        <MantineSelect
                          value={stage.calculationBase}
                          onChange={(value) => handleCalculationStageChange(index, "calculationBase", value as CalculationBase)}
                          data={calculationBases.map(base => ({
                            value: base,
                            label: getCalculationBaseLabel(base)
                          }))}
                        />
                      </div>

                      {/* Stage-specific calculation fields */}
                      {renderCalculationFields(stage, index)}
                    </Stack>
                  </Paper>
                ))}

                <Button
                  type="button"
                  onClick={handleAddCalculationStage}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" /> Stufe hinzufügen
                </Button>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-amount">Maximalbetrag</Label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        id="max-amount"
                        value={formData.maxAmount || ''}
                        onChange={(value) => handleChange("maxAmount", value)}
                        min={0}
                        className="flex-1"
                      />
                      <div className="text-lg font-medium">€</div>
                    </div>
                    <Text size="sm" c="dimmed" pl={40}>
                      Maximaler Betrag für alle Stufen
                    </Text>
                  </div>
                </div>
              </Stack>
            ) : (
              <div className="space-y-4">
                <div>
                  <Text size="sm" fw={500} mb={5}>Art der Berechnung</Text>
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
                  />
                </div>

                {/* Single calculation fields */}
                {formData.calculationBase === 'prozent_vom_vk' && (
                  <div>
                    <Text size="sm" fw={500} mb={5}>Prozentsatz</Text>
                    <NumberInput
                      id="value"
                      value={formData.value || 0}
                      onChange={(value) => handleChange("value", value)}
                      min={0}
                      max={100}
                      rightSection={<Text>%</Text>}
                      rightSectionWidth={30}
                    />
                  </div>
                )}

                {formData.calculationBase === 'fester_betrag' && (
                  <div>
                    <Text size="sm" fw={500} mb={5}>Betrag (€)</Text>
                    <NumberInput
                      id="value"
                      value={formData.value || 0}
                      onChange={(value) => handleChange("value", value)}
                      min={0}
                      rightSection={<Text>€</Text>}
                      rightSectionWidth={30}
                    />
                  </div>
                )}

                {formData.calculationBase === 'preisstaffel' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Text size="sm" fw={500}>Preisstaffelung</Text>
                    </div>
                    
                    {(formData.priceThresholds || []).map((threshold, index) => (
                      <Paper key={index} p="md" withBorder>
                        <Stack gap="md">
                          <Group grow>
                            <div>
                              <Text size="sm" fw={500} mb={5}>Min (€)</Text>
                              <NumberInput
                                value={threshold.minPrice}
                                disabled
                                styles={{ input: { backgroundColor: 'var(--mantine-color-gray-1)' } }}
                              />
                            </div>
                            <div>
                              <Text size="sm" fw={500} mb={5}>Max (€)</Text>
                              <NumberInput
                                value={threshold.maxPrice || undefined}
                                onChange={(value) => handlePriceThresholdChange(0, index, 'maxPrice', value)}
                                min={threshold.minPrice + 1}
                                placeholder={index === (formData.priceThresholds?.length || 0) - 1 ? "Unbegrenzt" : ""}
                              />
                            </div>
                            <div>
                              <Text size="sm" fw={500} mb={5}>Wert</Text>
                              <NumberInput
                                value={threshold.value}
                                onChange={(value) => handlePriceThresholdChange(0, index, 'value', value)}
                                min={0}
                              />
                            </div>
                            <div>
                              <Text size="sm" fw={500} mb={5}>Art</Text>
                              <MantineSelect
                                value={threshold.valueType || 'percent'}
                                onChange={(value) => handlePriceThresholdChange(0, index, 'valueType', value as ThresholdValueType)}
                                data={[
                                  { value: 'percent', label: '%' },
                                  { value: 'fixed', label: '€' }
                                ]}
                              />
                            </div>
                            <div>
                              <Text size="sm" fw={500} mb={5}>Rundungsregel</Text>
                              <MantineSelect
                                value={threshold.roundingRule}
                                onChange={(value) => handlePriceThresholdChange(0, index, 'roundingRule', value as RoundingRule)}
                                data={roundingRules.map(rule => ({
                                  value: rule,
                                  label: getRoundingRuleLabel(rule)
                                }))}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="lg"
                                disabled={formData.priceThresholds?.length === 1}
                                onClick={() => handleRemovePriceThreshold(0, index)}
                              >
                                <IconMinus size={16} />
                              </ActionIcon>
                            </div>
                          </Group>

                          <Group>
                            <MantineCheckbox
                              checked={threshold.consultPartnerBeforePayout || false}
                              onChange={(event) => 
                                handlePriceThresholdChange(0, index, 'consultPartnerBeforePayout', event.currentTarget.checked)
                              }
                            />
                            <Text size="sm">
                              Vor Auszahlung Merchant kontaktieren
                            </Text>
                          </Group>
                        </Stack>
                      </Paper>
                    ))}
                  </div>
                )}

                {formData.calculationBase !== 'preisstaffel' && formData.calculationBase !== 'fester_betrag' && formData.calculationBase !== 'keine_berechnung' && (
                  <div>
                    <Text size="sm" fw={500} mb={5}>Rundungsregel</Text>
                    <MantineSelect
                      value={formData.roundingRule}
                      onChange={(value) => handleChange("roundingRule", value as RoundingRule)}
                      data={roundingRules.map(rule => ({
                        value: rule,
                        label: getRoundingRuleLabel(rule)
                      }))}
                    />
                  </div>
                )}
                {(formData.calculationBase === 'prozent_vom_vk' || formData.calculationBase === 'preisstaffel') && (
                  <div>
                    <Text size="sm" fw={500} mb={5}>Maximalbetrag</Text>
                    <NumberInput
                      value={formData.maxAmount || ''}
                      onChange={(value) => handleChange("maxAmount", value)}
                      min={0}
                      rightSection={<Text>€</Text>}
                      rightSectionWidth={30}
                    />
                    <Text size="xs" c="dimmed" mt={5}>
                      Maximaler Betrag für den Preisnachlass
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Stack>
        </Paper>
      )}
      
      <Paper p="md" withBorder>
        <Stack gap="md">
          <div className="space-y-4">
            <Group>
              <MantineCheckbox 
                checked={formData.consultPartnerBeforePayout || false}
                disabled={formData.calculationBase === 'keine_berechnung' || formData.isCompleteRule === false}
                onChange={(event) => handleChange("consultPartnerBeforePayout", event.currentTarget.checked)}
              />
              <Text size="sm" c={formData.calculationBase === 'keine_berechnung' || formData.isCompleteRule === false ? "dimmed" : undefined}>
                Rücksprache mit Partner vor Auszahlung
                {(formData.calculationBase === 'keine_berechnung' || formData.isCompleteRule === false) && (
                  <Text span c="yellow.6" ml={5}>(Erforderlich)</Text>
                )}
              </Text>
            </Group>
            <Text size="sm" c="dimmed" pl={40}>
              Wenn keine Rückmeldung zu einer Preisnachlass Anfrage innerhalb von 2 Werktagen erfolgt wird der Preisnachlassautomatisch gewährt
            </Text>
          </div>
          
          <div>
            <Text size="sm" fw={500} mb={5}>Notizen</Text>
            <MantineTextarea 
              value={formData.notes || ''} 
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Zusätzliche Hinweise zur Regel"
              minRows={4}
            />
          </div>
        </Stack>
      </Paper>
    </form>
  );
};

export default RuleForm;
