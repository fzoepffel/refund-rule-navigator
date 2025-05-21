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
  ReturnStrategy,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@mantine/core';
import { IconArrowLeft, IconPlus, IconMinus, IconDeviceFloppy, IconChevronDown } from '@tabler/icons-react';
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

interface RuleFormProps {
  rule?: DiscountRule;
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
  returnStrategy: ReturnStrategy;
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
  returnStrategy: "discount_then_return",
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

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DiscountRule>({
    id: Date.now().toString(),
    name: '',
    requestType: 'Egal',
    requestCategory: [],
    triggers: [],
    calculationBase: 'prozent_vom_vk',
    roundingRule: 'keine_rundung',
    returnHandling: 'keine_retoure',
    shippingType: 'Egal',
    packageOpened: 'Egal',
    returnStrategy: 'discount_then_return',
    value: 0,
    consultPartnerBeforePayout: false,
    hasMultipleStages: false,
    calculationStages: [{
      calculationBase: 'prozent_vom_vk',
      value: 0,
      roundingRule: 'keine_rundung'
    }],
    customerOptions: ['Preisnachlass']
  });
  
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
  
  const returnStrategies: {value: ReturnStrategy; label: string}[] = [
    { value: 'auto_return_full_refund', label: 'Automatische Retoure mit voller Kostenerstattung' },
    { value: 'discount_then_return', label: 'Preisnachlass anbieten, bei Ablehnung Retoure' },
    { value: 'discount_then_keep', label: 'Preisnachlass anbieten, bei Ablehnung volle Erstattung ohne Rücksendung' },
    { value: 'discount_then_contact_merchant', label: 'Preisnachlass anbieten, bei Ablehnung Merchant kontaktieren' },
    { value: 'contact_merchant_immediately', label: 'Sofort Merchant kontaktieren' }
  ];
  
  // Effect to handle Mangel trigger selection/deselection
  useEffect(() => {
    if (formData.triggers.includes('Mangel')) {
      // Add all Mangel triggers if they're not already selected
      const newTriggers = [...formData.triggers];
      mangelTriggers.forEach(trigger => {
        if (!newTriggers.includes(trigger)) {
          newTriggers.push(trigger);
        }
      });
      setFormData(prev => ({ ...prev, triggers: newTriggers }));
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
      parts.push("nicht originalverpackt ");
    }

    return parts.filter(part => part).join(", ");
  };
  
  // Effect to manage the automatic checking of "consultPartnerBeforePayout" when calculationBase is "keine_berechnung"
  useEffect(() => {
    if (formData.calculationBase === 'keine_berechnung') {
      setFormData(prev => ({
        ...prev,
        consultPartnerBeforePayout: true
      }));
    }
  }, [formData.calculationBase]);
  
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
  
  // Effect to handle setting a full refund when auto_return_full_refund is selected
  useEffect(() => {
    if (formData.returnStrategy === 'auto_return_full_refund') {
      setFormData(prev => ({
        ...prev,
        calculationBase: 'fester_betrag',
        value: 100,
        returnHandling: 'automatisches_label'
      }));
    } else if (formData.returnStrategy === 'contact_merchant_immediately') {
      setFormData(prev => ({
        ...prev,
        consultPartnerBeforePayout: true,
        calculationBase: 'keine_berechnung'
      }));
    }
  }, [formData.returnStrategy]);
  
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
      name: generateRuleName()
    };
    
    onSave(finalData);
  };
  
  const renderDiscountLevelsSection = () => {
    if (formData.calculationBase !== 'angebotsstaffel') return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Angebotsabfolge</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddDiscountLevel}
          >
            <IconPlus className="h-4 w-4 mr-1" /> Stufe hinzufügen
          </Button>
        </div>
        
        {(formData.discountLevels || []).map((level, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4 border p-4 rounded-md">
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                className="w-20"
                value={level.value} 
                onChange={(e) => handleDiscountLevelChange(index, "value", parseFloat(e.target.value))}
                min={1}
              />
              <Select
                value={level.valueType}
                onValueChange={(value: ThresholdValueType) => 
                  handleDiscountLevelChange(index, "valueType", value)
                }
              >
                <SelectTrigger className="w-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">%</SelectItem>
                  <SelectItem value="fixed">€</SelectItem>
                </SelectContent>
              </Select>
              
              {index < (formData.discountLevels?.length || 0) - 1 && (
                <span className="mx-1">→</span>
              )}
            </div>
            
            <div>
              <Label htmlFor={`level-rounding-${index}`}>Rundungsregel</Label>
              <Select
                value={level.roundingRule}
                onValueChange={(value: RoundingRule) => 
                  handleDiscountLevelChange(index, "roundingRule", value)
                }
              >
                <SelectTrigger id={`level-rounding-${index}`}>
                  <SelectValue placeholder="Rundungsregel auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {roundingRules.map(rule => (
                    <SelectItem key={rule} value={rule}>
                      {getRoundingRuleLabel(rule)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                disabled={formData.discountLevels?.length === 1}
                onClick={() => handleRemoveDiscountLevel(index)}
              >
                <IconMinus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {(!formData.discountLevels || formData.discountLevels.length === 0) && (
          <Button type="button" variant="outline" onClick={handleAddDiscountLevel}>
            <IconPlus className="h-4 w-4 mr-2" /> Erste Stufe hinzufügen
          </Button>
        )}
      </div>
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
              <Label>Prozent</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={stage.value}
                  onChange={(e) => handleCalculationStageChange(stageIndex, 'value', parseFloat(e.target.value))}
                  min={0}
                  max={100}
                />
                <div className="text-lg font-medium">%</div>
              </div>
            </div>
            <div>
              <Label>Rundungsregel</Label>
              <Select
                value={stage.roundingRule}
                onValueChange={(value) => handleCalculationStageChange(stageIndex, 'roundingRule', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rundungsregel auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {roundingRules.map((rule) => (
                    <SelectItem key={rule} value={rule}>
                      {getRoundingRuleLabel(rule)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'fester_betrag':
        return (
          <div className="space-y-4">
            <div>
              <Label>Betrag</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={stage.value}
                  onChange={(e) => handleCalculationStageChange(stageIndex, 'value', parseFloat(e.target.value))}
                  min={0}
                />
                <div className="text-lg font-medium">€</div>
              </div>
            </div>
          </div>
        );
      case 'preisstaffel':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Preisstaffelung</Label>
            </div>
            
            {(priceThresholds || []).map((threshold, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start border p-4 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`min-${index}`}>Min (€)</Label>
                    <Input 
                      id={`min-${index}`} 
                      type="number" 
                      value={threshold.minPrice} 
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`max-${index}`}>Max (€)</Label>
                    <Input 
                      id={`max-${index}`} 
                      type="number" 
                      value={threshold.maxPrice || ''} 
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        handlePriceThresholdChange(stageIndex, index, 'maxPrice', value);
                      }}
                      min={threshold.minPrice + 1}
                      placeholder={index === (priceThresholds?.length || 0) - 1 ? "Unbegrenzt" : ""}
                    />
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`value-${index}`}>Wert</Label>
                    <Input 
                      id={`value-${index}`} 
                      type="number" 
                      value={threshold.value} 
                      onChange={(e) => handlePriceThresholdChange(stageIndex, index, 'value', parseFloat(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="w-20">
                    <Label htmlFor={`valueType-${index}`}>Art</Label>
                    <Select
                      value={threshold.valueType || 'percent'}
                      onValueChange={(value: ThresholdValueType) => 
                        handlePriceThresholdChange(stageIndex, index, 'valueType', value)
                      }
                    >
                      <SelectTrigger id={`valueType-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {thresholdValueTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {getThresholdValueTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`threshold-rounding-${index}`}>Rundungsregel</Label>
                    <Select
                      value={threshold.roundingRule}
                      onValueChange={(value: RoundingRule) => 
                        handlePriceThresholdChange(stageIndex, index, 'roundingRule', value)
                      }
                    >
                      <SelectTrigger id={`threshold-rounding-${index}`}>
                        <SelectValue placeholder="Rundungsregel auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {roundingRules.map(rule => (
                          <SelectItem key={rule} value={rule}>
                            {getRoundingRuleLabel(rule)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 self-end"
                    disabled={priceThresholds?.length === 1}
                    onClick={() => handleRemovePriceThreshold(stageIndex, index)}
                  >
                    <IconMinus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id={`threshold-consult-${index}`}
                    checked={threshold.consultPartnerBeforePayout || false}
                    onCheckedChange={(checked) => 
                      handlePriceThresholdChange(stageIndex, index, 'consultPartnerBeforePayout', checked)
                    }
                  />
                  <Label htmlFor={`threshold-consult-${index}`} className="text-sm">
                    Vor Auszahlung Merchant kontaktieren
                  </Label>
                </div>
              </div>
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
      
      // If calculation base is changed to preisstaffel, create first threshold
      if (field === 'calculationBase' && value === 'preisstaffel') {
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
      
      return { ...prev, calculationStages: stages };
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />} 
          onClick={onCancel}
        >
          Zurück
        </Button>
        <h2 className="text-xl font-bold flex-1">
          {rule ? 'Regel bearbeiten' : 'Neue Regel erstellen'}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grundlegende Informationen</CardTitle>
          <CardDescription>
            Definieren Sie die grundlegenden Parameter für diese Regel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ruleName">Regelname</Label>
            <Input
              id="ruleName"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Name der Regel"
            />
          </div>

          <div className="grid gap-2">
            <Label>Auslöser</Label>
            <div className="grid gap-2">
              {mainTriggers.map((trigger) => (
                <div key={trigger} className="flex items-center space-x-2">
                  <Checkbox
                    id={trigger}
                    checked={formData.triggers.includes(trigger)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTrigger(trigger);
                      } else {
                        handleChange('triggers', formData.triggers.filter(t => t !== trigger));
                      }
                    }}
                  />
                  <Label htmlFor={trigger}>{getTriggerLabel(trigger)}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Versandart</Label>
            <Select
              value={formData.shippingType}
              onValueChange={(value) => handleChange('shippingType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Versandart auswählen" />
              </SelectTrigger>
              <SelectContent>
                {shippingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Originalverpackt</Label>
            <Select
              value={formData.packageOpened}
              onValueChange={(value) => handleChange('packageOpened', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Egal">Egal</SelectItem>
                <SelectItem value="yes">Ja</SelectItem>
                <SelectItem value="no">Nein</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Berechnung</CardTitle>
          <CardDescription>
            Definieren Sie, wie der Preisnachlass berechnet werden soll.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Berechnungsbasis</Label>
            <Select
              value={formData.calculationBase}
              onValueChange={(value) => handleChange('calculationBase', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Berechnungsbasis auswählen" />
              </SelectTrigger>
              <SelectContent>
                {calculationBases.map((base) => (
                  <SelectItem key={base} value={base}>
                    {getCalculationBaseLabel(base)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.calculationBase !== 'keine_berechnung' && (
            <>
              <div className="grid gap-2">
                <Label>Rundungsregel</Label>
                <Select
                  value={formData.roundingRule}
                  onValueChange={(value) => handleChange('roundingRule', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rundungsregel auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {roundingRules.map((rule) => (
                      <SelectItem key={rule} value={rule}>
                        {getRoundingRuleLabel(rule)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.calculationBase === 'preisstaffel' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Preisstaffeln</Label>
                    <Button 
                      variant="light" 
                      leftSection={<IconPlus size={16} />}
                      onClick={() => handleAddPriceThreshold(0)}
                    >
                      Staffel hinzufügen
                    </Button>
                  </div>
                  {formData.priceThresholds?.map((threshold, index) => (
                    <div key={index} className="grid gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Staffel {index + 1}</h4>
                        <Button 
                          variant="subtle" 
                          color="red"
                          leftSection={<IconMinus size={16} />}
                          onClick={() => handleRemovePriceThreshold(0, index)}
                        >
                          Entfernen
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Min. Preis</Label>
                            <Input
                              type="number"
                              value={threshold.minPrice}
                              onChange={(e) => handlePriceThresholdChange(0, index, 'minPrice', Number(e.target.value))}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Max. Preis</Label>
                            <Input
                              type="number"
                              value={threshold.maxPrice || ''}
                              onChange={(e) => handlePriceThresholdChange(0, index, 'maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Werttyp</Label>
                            <Select
                              value={threshold.valueType}
                              onValueChange={(value) => handlePriceThresholdChange(0, index, 'valueType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Werttyp auswählen" />
                              </SelectTrigger>
                              <SelectContent>
                                {thresholdValueTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {getThresholdValueTypeLabel(type)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Wert</Label>
                            <Input
                              type="number"
                              value={threshold.value}
                              onChange={(e) => handlePriceThresholdChange(0, index, 'value', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button 
          variant="light" 
          onClick={onCancel}
        >
          Abbrechen
        </Button>
        <Button 
          variant="filled" 
          type="submit"
          leftSection={<IconDeviceFloppy size={16} />}
        >
          Speichern
        </Button>
      </div>
    </form>
  );
};

export default RuleForm;
