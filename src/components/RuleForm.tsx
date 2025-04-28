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
  DiscountLevel
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Save, ChevronDown } from "lucide-react";
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
  requestCategory: RequestCategory;
  triggers: Trigger[];
  calculationBase: CalculationBase;
  roundingRule: RoundingRule;
  returnHandling: ReturnHandling;
  shippingType: ShippingType;
  packageOpened: 'yes' | 'no' | 'Egal';
  returnStrategy: ReturnStrategy;
  value: number;
  isCompleteRule: boolean;
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
}

const defaultRule: DiscountRule = {
  id: "",
  name: "",
  requestType: "Egal",
  requestCategory: "Egal", // Ensure default is "Egal"
  triggers: ["Egal"],
  calculationBase: "prozent_vom_vk",
  roundingRule: "keine_rundung",
  returnHandling: "keine_retoure",
  shippingType: "Egal",
  packageOpened: "Egal",
  returnStrategy: "discount_then_return",
  value: 10,
  isCompleteRule: false,         // Default to false
  consultPartnerBeforePayout: true,  // Default to true
  hasMultipleStages: false,
  calculationStages: [{
    calculationBase: "prozent_vom_vk",
    value: 10,
    roundingRule: "keine_rundung"
  }]
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DiscountRule>(rule || { 
    ...defaultRule, 
    id: Date.now().toString(),
  });
  
  const requestCategories: RequestCategory[] = ['Egal', 'Widerruf', 'Reklamation'];
  
  const triggers: Trigger[] = [
    'Egal',
    'Leistung oder Qualität ungenügend',
    'Inkompatibel oder für den vorgesehenen Einsatz ungeeignet',
    'Gefällt mir nicht mehr',
    'Irrtümlich bestellt',
    'Günstigeren Preis entdeckt',
    'Artikel beschädigt/funktioniert nicht mehr',
    'Versandverpackung und Artikel beschädigt',
    'Teile oder Zubehör fehlen',
    'Falscher Artikel',
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
    { value: 'discount_then_contact_merchant', label: 'Preisnachlass anbieten, dann Merchant kontaktieren' },
    { value: 'contact_merchant_immediately', label: 'Sofort Merchant kontaktieren' }
  ];
  
  // Generate rule name according to new schema
  const generateRuleName = () => {
    if (formData.name) return formData.name;
    
    const parts: string[] = [];

    // Part 1: Art der Anfrage
    if (formData.requestCategory !== "Egal") {
      parts.push(formData.requestCategory);
    } else {
      parts.push("Widerruf und Reklamation");
    }

    // Part 2: Grund
    if (formData.triggers.length > 0) {
      if (formData.triggers.length === 1 && formData.triggers[0] !== "Egal") {
        parts.push(formData.triggers[0]);
      } else if (formData.triggers.length > 1) {
        parts.push("Mehrere Gründe");
      }
    }

    // Part 4: Versandart
    if (formData.shippingType !== "Egal") {
      parts.push(formData.shippingType === "Paket" ? "Paket" : "Spedition");
    } 

    // Part 5: Produkt geöffnet
    if (formData.packageOpened === "yes") {
      parts.push("Produkt geöffnet");
    } else if (formData.packageOpened === "no") {
      parts.push("Produkt nicht geöffnet");
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If calculation base is changed to preisstaffel, create first threshold
      if (field === 'calculationBase' && value === 'preisstaffel' && (!prev.priceThresholds || prev.priceThresholds.length === 0)) {
        newData.priceThresholds = [{
          minPrice: 0,
          value: 10,
          valueType: 'percent',
          roundingRule: 'keine_rundung'
        }];
      }
      
      return newData;
    });
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
            <Plus className="h-4 w-4 mr-1" /> Stufe hinzufügen
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
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {(!formData.discountLevels || formData.discountLevels.length === 0) && (
          <Button type="button" variant="outline" onClick={handleAddDiscountLevel}>
            <Plus className="h-4 w-4 mr-2" /> Erste Stufe hinzufügen
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
                    <Minus className="h-4 w-4" />
                  </Button>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold flex-1">
          {rule ? "Regel bearbeiten" : "Neue Regel erstellen"}
        </h2>
        <Button type="submit" className="flex items-center gap-2">
          <Save className="h-4 w-4" /> Speichern
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Grundinformationen zum Regelfall</CardTitle>
          <CardDescription>Hier wird der Fall definiert, für welchen diese Preisnachlassregel erstellt werden soll. Jeder Merchant kann eine beliebige Anzahl an Regeln zu einer beliebigen Anzahl an Fällen definieren. Wird in einem der Menüs "Egal" ausgewählt, so wird die Regel für alle Fälle gelten, sofern nicht anders definiert.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Regelname (optional)</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder={generateRuleName()}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leer lassen für automatisch generierten Namen: {generateRuleName()}
            </p>
          </div>
          
          {/* Art der Anfrage */}
          <div>
            <Label htmlFor="requestCategory">Art der Anfrage</Label>
            <Select 
              value={formData.requestCategory || 'Egal'} 
              onValueChange={(value: RequestCategory) => handleChange("requestCategory", value)}
            >
              <SelectTrigger id="requestCategory">
                <SelectValue placeholder="Art der Anfrage auswählen" />
              </SelectTrigger>
              <SelectContent>
                {requestCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grund */}
          <div>
            <Label htmlFor="triggers">Gründe</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {formData.triggers.length === 0 ? "Egal" : 
                   formData.triggers.length === 1 ? getTriggerLabel(formData.triggers[0]) :
                   `${formData.triggers.length} Gründe ausgewählt`}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {triggers.map(trigger => (
                  <div key={trigger} className="flex items-center space-x-2 p-2 hover:bg-accent">
                    <Checkbox
                      id={`trigger-${trigger}`}
                      checked={formData.triggers.includes(trigger)}
                      onCheckedChange={() => setTrigger(trigger)}
                    />
                    <Label htmlFor={`trigger-${trigger}`} className="text-sm font-normal cursor-pointer">
                      {getTriggerLabel(trigger)}
                    </Label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Versandart */}
          <div>
            <Label htmlFor="shippingType">Versandart</Label>
            <Select 
              value={formData.shippingType || 'Egal'} 
              onValueChange={(value: ShippingType) => handleChange("shippingType", value)}
            >
              <SelectTrigger id="shippingType">
                <SelectValue placeholder="Versandart auswählen" />
              </SelectTrigger>
              <SelectContent>
                {shippingTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Produkt geöffnet? */}
          <div>
            <Label htmlFor="packageOpened">Produkt geöffnet?</Label>
            <Select 
              value={formData.packageOpened || 'Egal'} 
              onValueChange={(value: 'yes' | 'no' | 'Egal') => handleChange("packageOpened", value)}
            >
              <SelectTrigger id="packageOpened">
                <SelectValue placeholder="Bitte auswählen" />
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
      
      {/* Return Strategy Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preisnachlassstrategie</CardTitle>
          <CardDescription>Hier wird definiert, nach welcher Strategie der oben definierte Regelfall behandelt wird.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Select 
                value={formData.returnStrategy || 'discount_then_return'} 
                onValueChange={(value: ReturnStrategy) => handleChange("returnStrategy", value)}
              >
                <SelectTrigger id="returnStrategy">
                  <SelectValue placeholder="Rückgabestrategie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {returnStrategies.map(strategy => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.returnStrategy === 'discount_then_return' || 
              formData.returnStrategy === 'discount_then_keep' || 
              formData.returnStrategy === 'discount_then_contact_merchant') && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMultipleStages"
                    checked={formData.hasMultipleStages}
                    onCheckedChange={(checked) => handleChange("hasMultipleStages", checked)}
                  />
                  <Label htmlFor="hasMultipleStages">Mehrere Angebotsstufen</Label>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Wird hier ein Haken gesetzt, können Preisnachlässe in mehreren Stufen definiert werden. 
                  Dem Kunden wird Schritt für Schritt die nächsthöhere Angebotsstufe angeboten bevor der finale Ablehnungsfall eintritt.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {formData.returnStrategy !== 'auto_return_full_refund' && formData.returnStrategy !== 'contact_merchant_immediately' && (
        <Card>
          <CardHeader>
            <CardTitle>Berechnungsgrundlage</CardTitle>
            <CardDescription>Soll ein Preisnachlass im gegebenen Regelfall und bei der gewählten Strategie gewährt werden, wird hier definiert, wie dieser berechnet wird.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.hasMultipleStages ? (
              <div className="space-y-6">
                {(formData.calculationStages || []).map((stage, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Stufe {index + 1}</h3>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCalculationStage(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`calculationBase-${index}`}>Art der Berechnung</Label>
                      <Select 
                        value={stage.calculationBase} 
                        onValueChange={(value: CalculationBase) => handleCalculationStageChange(index, "calculationBase", value)}
                      >
                        <SelectTrigger id={`calculationBase-${index}`}>
                          <SelectValue placeholder="Berechnungsgrundlage auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {calculationBases.map(base => (
                            <SelectItem key={base} value={base}>
                              {getCalculationBaseLabel(base)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Stage-specific calculation fields */}
                    {renderCalculationFields(stage, index)}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCalculationStage}
                >
                  <Plus className="h-4 w-4 mr-2" /> Weitere Stufe hinzufügen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calculationBase">Art der Berechnung</Label>
                  <Select 
                    value={formData.calculationBase} 
                    onValueChange={(value: CalculationBase) => handleChange("calculationBase", value)}
                  >
                    <SelectTrigger id="calculationBase">
                      <SelectValue placeholder="Berechnungsgrundlage auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {calculationBases.map(base => (
                        <SelectItem key={base} value={base}>
                          {getCalculationBaseLabel(base)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Single calculation fields */}
                {formData.calculationBase === 'prozent_vom_vk' && (
                  <div>
                    <Label htmlFor="value">Prozentsatz</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="value" 
                        type="number" 
                        value={formData.value || ''} 
                        onChange={(e) => handleChange("value", parseFloat(e.target.value))}
                        min={0}
                      />
                      <div className="text-lg font-medium">%</div>
                    </div>
                  </div>
                )}

                {formData.calculationBase === 'fester_betrag' && (
                  <div>
                    <Label htmlFor="value">Betrag (€)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="value" 
                        type="number" 
                        value={formData.value || ''} 
                        onChange={(e) => handleChange("value", parseFloat(e.target.value))}
                        min={0}
                      />
                      <div className="text-lg font-medium">€</div>
                    </div>
                  </div>
                )}

                {formData.calculationBase === 'preisstaffel' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Preisstaffelung</Label>
                    </div>
                    
                    {(formData.priceThresholds || []).map((threshold, index) => (
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
                                handlePriceThresholdChange(0, index, 'maxPrice', value);
                              }}
                              min={threshold.minPrice + 1}
                              placeholder={index === (formData.priceThresholds?.length || 0) - 1 ? "Unbegrenzt" : ""}
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
                              onChange={(e) => handlePriceThresholdChange(0, index, 'value', parseFloat(e.target.value))}
                              min={0}
                            />
                          </div>
                          <div className="w-20">
                            <Label htmlFor={`valueType-${index}`}>Art</Label>
                            <Select
                              value={threshold.valueType || 'percent'}
                              onValueChange={(value: ThresholdValueType) => 
                                handlePriceThresholdChange(0, index, 'valueType', value)
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
                                handlePriceThresholdChange(0, index, 'roundingRule', value)
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
                            disabled={formData.priceThresholds?.length === 1}
                            onClick={() => handleRemovePriceThreshold(0, index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.calculationBase !== 'preisstaffel' && formData.calculationBase !== 'fester_betrag' && formData.calculationBase !== 'keine_berechnung' && (
                  <div>
                    <Label htmlFor="roundingRule">Rundungsregel</Label>
                    <Select 
                      value={formData.roundingRule} 
                      onValueChange={(value: RoundingRule) => handleChange("roundingRule", value)}
                    >
                      <SelectTrigger id="roundingRule">
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
                )}
              </div>
            )}
            {formData.calculationBase !== 'fester_betrag' && formData.calculationBase !== 'keine_berechnung' && (
              <div>
                <Label htmlFor="maxAmount">Maximalbetrag (€) (optional)</Label>
                <Input 
                  id="maxAmount" 
                  type="number" 
                  value={formData.maxAmount || ''} 
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    handleChange("maxAmount", value);
                  }}
                  min={0}
                  placeholder="Kein Maximum"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {formData.requestType === 'Artikel zurücksenden' && (
        <Card>
          <CardHeader>
            <CardTitle>Retourenabwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="returnHandling">Art der Retourenabwicklung</Label>
              <Select 
                value={formData.returnHandling} 
                onValueChange={(value: ReturnHandling) => handleChange("returnHandling", value)}
                disabled={formData.returnStrategy === 'auto_return_full_refund'}
              >
                <SelectTrigger id="returnHandling">
                  <SelectValue placeholder="Retourenabwicklung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {returnHandlings.map(handling => (
                    <SelectItem key={handling} value={handling}>
                      {getReturnHandlingLabel(handling)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            
        
          
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="isCompleteRule" 
                  checked={formData.isCompleteRule || false}
                  onCheckedChange={(checked) => handleChange("isCompleteRule", checked)}
                />
                <div>
                  <Label htmlFor="isCompleteRule" className="text-base">
                    Regel konnte vollständig und eindeutig erfasst werden
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Wenn die Regel nicht vollständig erfasst werden konnte, ist eine Rücksprache mit dem Partner notwendig.
                    In diesem Fall muss auch der Haken "Rücksprache mit Partner vor Auszahlung" gesetzt sein.
                  </p>
                </div>
              </div>
            
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="consultPartnerBeforePayout" 
                  checked={formData.consultPartnerBeforePayout || false}
                  disabled={formData.calculationBase === 'keine_berechnung' || formData.isCompleteRule === false}
                  onCheckedChange={(checked) => handleChange("consultPartnerBeforePayout", checked)}
                />
                <Label htmlFor="consultPartnerBeforePayout" className={
                  formData.calculationBase === 'keine_berechnung' || formData.isCompleteRule === false
                    ? "text-muted-foreground" 
                    : ""
                }>
                  Rücksprache mit Partner vor Auszahlung
                  {(formData.calculationBase === 'keine_berechnung' || formData.isCompleteRule === false) && (
                    <span className="text-amber-600 ml-1">(Erforderlich)</span>
                  )}
                </Label>
              </div>
            </div>
          
            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea 
                id="notes" 
                value={formData.notes || ''} 
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Zusätzliche Hinweise zur Regel"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default RuleForm;
