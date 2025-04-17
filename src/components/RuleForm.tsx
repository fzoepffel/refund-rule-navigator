import React, { useState, useEffect } from "react";
import { 
  DiscountRule, 
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
  CalculationStage
} from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getRequestTypeLabel,
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getReturnHandlingLabel,
  getThresholdValueTypeLabel
} from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Save, ChevronDown, History, Car, Trash } from "lucide-react";
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
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X } from "lucide-react";

interface RuleFormProps {
  rule?: DiscountRule;
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
}

const defaultRule: DiscountRule = {
  id: "",
  name: "",
  requestType: "Egal",
  requestCategory: "Egal",
  triggers: ["Egal"],
  calculationBase: "prozent_vom_vk",
  roundingRule: "keine_rundung",
  returnHandling: "keine_retoure",
  shippingType: "Egal",
  packageOpened: "Egal",
  returnStrategy: "discount_then_return",
  value: 10,
  isCompleteRule: false,         // Default to false
  consultPartnerBeforePayout: true  // Default to true
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DiscountRule>(rule || { 
    ...defaultRule, 
    id: Date.now().toString(),
  });
  
  const requestCategories: RequestCategory[] = ['Egal', 'Widerruf', 'Reklamation'];
  
  const requestTypes: RequestType[] = [
    'Egal',
    'Ersatzteil gewünscht',
    'Preisnachlass gewünscht',
    'Kontaktaufnahme gewünscht',
    'Artikel zurücksenden',
    'Rücksendung gewünscht'
  ];
  
  const triggers: Trigger[] = [
    'Egal',
    'Leistung oder Qualität ungenügend',
    'Inkompatibel oder für den vorgesehenen Einsatz ungeeignet',
    'Gefällt mir nicht mehr',
    'Irrtümlich bestellt',
    'Günstigeren Preis entdeckt',
    'Keinen Grund angegeben',
    'Artikel beschädigt/funktioniert nicht mehr',
    'Versandverpackung und Artikel beschädigt',
    'Teile oder Zubehör fehlen',
    'Falscher Artikel',
    'Sonstiges'
  ];
  
  const calculationBases: CalculationBase[] = ['keine_berechnung', 'prozent_vom_vk', 'fester_betrag', 'preisstaffel', 'angebotsstaffel'];
  const roundingRules: RoundingRule[] = ['keine_rundung', 'auf_5_euro', 'auf_10_euro', 'auf_10_cent'];
  const returnHandlings: ReturnHandling[] = ['automatisches_label', 'manuelles_label', 'zweitverwerter', 'keine_retoure'];
  const thresholdValueTypes: ThresholdValueType[] = ['percent', 'fixed'];
  const shippingTypes: ShippingType[] = ['Egal', 'paket', 'spedition'];
  
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
    if (formData.triggers.length >0 && formData.triggers[0] !== "Egal") {
      parts.push(formData.triggers[0]);
    }

    // Part 3: Gewünschte Vorgehensweise (nur bei Egal oder Reklamation)
    if ((formData.requestCategory === "Egal" || formData.requestCategory === "Reklamation") && 
        formData.requestType !== "Egal") {
      parts.push(formData.requestType);
    }

    // Part 4: Versandart
    if (formData.shippingType !== "Egal") {
      parts.push(formData.shippingType === "paket" ? "Paket" : "Spedition");
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
        returnHandling: 'automatisches_label',
        multiStageDiscount: false
      }));
    } else if (formData.returnStrategy === 'contact_merchant_immediately') {
      setFormData(prev => ({
        ...prev,
        consultPartnerBeforePayout: true,
        calculationBase: 'keine_berechnung',
        multiStageDiscount: false
      }));
    }
  }, [formData.returnStrategy]);
  
  const handleChange = (field: keyof DiscountRule, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Set the trigger directly when selected from radio group
  const setTrigger = (trigger: Trigger) => {
    setFormData(prev => ({
      ...prev,
      triggers: [trigger] // Now we only store a single trigger
    }));
  };

  const getSelectedTriggerLabel = () => {
    if (formData.triggers.length === 0) {
      return "Egal";
    }
    return getTriggerLabel(formData.triggers[0]);
  };
  
  const handleAddPriceThreshold = (event: React.MouseEvent<HTMLButtonElement>, stageId?: string) => {
    if (stageId) {
      // Add price threshold to a specific calculation stage
      setFormData(prev => {
        const stages = [...(prev.calculationStages || [])];
        const stageIndex = stages.findIndex(stage => stage.id === stageId);
        
        if (stageIndex !== -1) {
          const stage = stages[stageIndex];
          const thresholds = [...(stage.priceThresholds || [])];
          const lastThreshold = thresholds[thresholds.length - 1];
          const newMin = lastThreshold ? (lastThreshold.maxPrice || lastThreshold.minPrice + 1) : 0;
          
          stages[stageIndex] = {
            ...stage,
            priceThresholds: [
              ...thresholds,
              { minPrice: newMin, value: 10, valueType: 'percent', roundingRule: 'keine_rundung' }
            ]
          };
        }
        
        return { ...prev, calculationStages: stages };
      });
    } else {
      // Add price threshold to the main rule
      const thresholds = formData.priceThresholds || [];
      const lastThreshold = thresholds[thresholds.length - 1];
      const newMin = lastThreshold ? (lastThreshold.maxPrice || lastThreshold.minPrice + 1) : 0;
      
      setFormData(prev => ({
        ...prev,
        priceThresholds: [
          ...(prev.priceThresholds || []),\
          { minPrice: newMin, value: 10, valueType: 'percent', roundingRule: 'keine_rundung' }
        ]
      }));
    }
  };
  
  const handleRemovePriceThreshold = (index: number, stageId?: string) => {
    if (stageId) {
      // Remove price threshold from a specific calculation stage
      setFormData(prev => {
        const stages = [...(prev.calculationStages || [])];
        const stageIndex = stages.findIndex(stage => stage.id === stageId);
        
        if (stageIndex !== -1) {
          const stage = stages[stageIndex];
          stages[stageIndex] = {
            ...stage,
            priceThresholds: (stage.priceThresholds || []).filter((_, i) => i !== index)
          };
        }
        
        return { ...prev, calculationStages: stages };
      });
    } else {
      // Remove price threshold from the main rule
      setFormData(prev => ({
        ...prev,
        priceThresholds: prev.priceThresholds?.filter((_, i) => i !== index)
      }));
    }
  };
  
  const handlePriceThresholdChange = (index: number, field: keyof PriceThreshold, value: any, stageId?: string) => {
    if (stageId) {
      // Update price threshold in a specific calculation stage
      setFormData(prev => {
        const stages = [...(prev.calculationStages || [])];
        const stageIndex = stages.findIndex(stage => stage.id === stageId);
        
        if (stageIndex !== -1) {
          const stage = stages[stageIndex];
          const thresholds = [...(stage.priceThresholds || [])];
          thresholds[index] = { ...thresholds[index], [field]: value };
          
          stages[stageIndex] = {
            ...stage,
            priceThresholds: thresholds
          };
        }
        
        return { ...prev, calculationStages: stages };
      });
    } else {
      // Update price threshold in the main rule
      setFormData(prev => {
        const thresholds = [...(prev.priceThresholds || [])];
        thresholds[index] = { ...thresholds[index], [field]: value };
        return { ...prev, priceThresholds: thresholds };
      });
    }
  };
  
  const handleAddCalculationStage = () => {
    const newStage: CalculationStage = {
      id: Date.now().toString(),
      calculationBase: 'prozent_vom_vk',
      value: 10,
      roundingRule: 'keine_rundung'
    };
    
    setFormData(prev => ({
      ...prev,
      calculationStages: [...(prev.calculationStages || []), newStage]
    }));
  };
  
  const handleCalculationStageChange = (stageId: string, field: keyof CalculationStage, value: any) => {
    setFormData(prev => {
      const stages = [...(prev.calculationStages || [])];
      const stageIndex = stages.findIndex(stage => stage.id === stageId);
      
      if (stageIndex !== -1) {
        stages[stageIndex] = { ...stages[stageIndex], [field]: value };
      }
      
      return { ...prev, calculationStages: stages };
    });
  };
  
  const handleRemoveCalculationStage = (stageId: string) => {
    setFormData(prev => ({
      ...prev,
      calculationStages: (prev.calculationStages || []).filter(stage => stage.id !== stageId)
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
  
  // Check if multiple stage discount is applicable
  const isMultiStageApplicable = () => {
    return formData.returnStrategy === 'discount_then_return' || 
           formData.returnStrategy === 'discount_then_keep';
  };
  
  // Function to toggle multi-stage discount
  const toggleMultiStageDiscount = (checked: boolean) => {
    setFormData(prev => {
      // If enabling multi-stage discount, create the first stage
      const updatedStages = checked && (!prev.calculationStages || prev.calculationStages.length === 0) 
        ? [{
            id: Date.now().toString(),
            calculationBase: prev.calculationBase,
            value: prev.value,
            roundingRule: prev.roundingRule,
            priceThresholds: prev.calculationBase === 'preisstaffel' ? [...(prev.priceThresholds || [])] : undefined
          }] 
        : prev.calculationStages;
      
      return {
        ...prev,
        multiStageDiscount: checked,
        calculationStages: checked ? updatedStages : undefined
      };
    });
  };
  
  // Render a single calculation stage
  const renderCalculationStage = (stage: CalculationStage, index: number) => {
    return (
      <Card key={stage.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Angebotsstufe {index + 1}</CardTitle>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={(formData.calculationStages || []).length <= 1}
              onClick={() => handleRemoveCalculationStage(stage.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`calculationBase-${stage.id}`}>Art der Berechnung</Label>
            <Select 
              value={stage.calculationBase} 
              onValueChange={(value: CalculationBase) => handleCalculationStageChange(stage.id, "calculationBase", value)}
            >
              <SelectTrigger id={`calculationBase-${stage.id}`}>
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
          
          {(stage.calculationBase === 'prozent_vom_vk' || stage.calculationBase === 'fester_betrag') && (
            <div>
              <Label htmlFor={`value-${stage.id}`}>
                {stage.calculationBase === 'prozent_vom_vk' ? 'Prozentsatz' : 'Betrag (€)'}
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id={`value-${stage.id}`} 
                  type="number" 
                  value={stage.value || ''} 
                  onChange={(e) => handleCalculationStageChange(stage.id, "value", parseFloat(e.target.value))}
                  min={0}
                />
                <div className="text-lg font-medium w-6">
                  {stage.calculationBase === 'prozent_vom_vk' ? '%' : '€'}
                </div>
              </div>
            </div>
          )}
          
          {stage.calculationBase === 'preisstaffel' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Preisstaffelung</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => handleAddPriceThreshold(e, stage.id)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Staffel hinzufügen
                </Button>
              </div>
              
              {(stage.priceThresholds || []).map((threshold, thresholdIndex) => (
                <div key={thresholdIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start border p-4 rounded-md mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`min-${stage.id}-${thresholdIndex}`}>Min (€)</Label>
                      <Input 
                        id={`min-${stage.id}-${thresholdIndex}`} 
                        type="number" 
                        value={threshold.minPrice} 
                        onChange={(e) => handlePriceThresholdChange(thresholdIndex, "minPrice", parseFloat(e.target.value), stage.id)}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`max-${stage.id}-${thresholdIndex}`}>Max (€)</Label>
                      <Input 
                        id={`max-${stage.id}-${thresholdIndex}`} 
                        type="number" 
                        value={threshold.maxPrice || ''} 
                        onChange={(e) => {
                          const value = e.target.value ? parseFloat(e.target.value) : undefined;
                          handlePriceThresholdChange(thresholdIndex, "maxPrice", value, stage.id);
                        }}
                        min={threshold.minPrice + 1}
                        placeholder="Unbegrenzt"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`value-${stage.id}-${thresholdIndex}`}>Wert</Label>
                      <Input 
                        id={`value-${stage.id}-${thresholdIndex}`} 
                        type="number" 
                        value={threshold.value} 
                        onChange={(e) => handlePriceThresholdChange(thresholdIndex, "value", parseFloat(e.target.value), stage.id)}
                        min={0}
                      />
                    </div>
                    <div className="w-20">
                      <Label htmlFor={`valueType-${stage.id}-${thresholdIndex}`}>Art</Label>
                      <Select
                        value={threshold.valueType || 'percent'}
                        onValueChange={(value: ThresholdValueType) => 
                          handlePriceThresholdChange(thresholdIndex, "valueType", value, stage.id)
                        }
                      >
                        <SelectTrigger id={`valueType-${stage.id}-${thresholdIndex}`}>
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
                      <Label htmlFor={`threshold-rounding-${stage.id}-${thresholdIndex}`}>Rundungsregel</Label>
                      <Select
                        value={threshold.roundingRule}
                        onValueChange={(value: RoundingRule) => 
                          handlePriceThresholdChange(thresholdIndex, "roundingRule", value, stage.id)
                        }
                      >
                        <SelectTrigger id={`threshold-rounding-${stage.id}-${thresholdIndex}`}>
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
                      disabled={(stage.priceThresholds || []).length <= 1}
                      onClick={() => handleRemovePriceThreshold(thresholdIndex, stage.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {(!stage.priceThresholds || stage.priceThresholds.length === 0) && (
                <Button type="button" variant="outline" onClick={(e) => handleAddPriceThreshold(e, stage.id)}>
                  <Plus className="h-4 w-4 mr-2" /> Erste Staffel hinzufügen
                </Button>
              )}
            </div>
          )}
          
          <div>
            <Label htmlFor={`roundingRule-${stage.id}`}>Rundungsregel</Label>
            <Select 
              value={stage.roundingRule} 
              onValueChange={(value: RoundingRule) => handleCalculationStageChange(stage.id, "roundingRule", value)}
            >
              <SelectTrigger id={`roundingRule-${stage.id}`}>
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
        </CardContent>
      </Card>
    );
  };
  
  // Render calculation section based on multi-stage status
  const renderCalculationSection = () => {
    if (formData.returnStrategy === 'auto_return_full_refund' || formData.returnStrategy === 'contact_merchant_immediately') {
      return null; // No calculation section needed for these strategies
    }
    
    if (formData.multiStageDiscount) {
      // Render multiple calculation stages
      return (
        <Card>
          <CardHeader>
            <CardTitle>Mehrere Angebotsstufen</CardTitle>
            <CardDescription>Definieren Sie verschiedene Angebotsstufen für den Preisnachlass.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.calculationStages || []).map((stage, index) => renderCalculationStage(stage, index))}
            
            <Button type="button" variant="outline" onClick={handleAddCalculationStage} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Weitere Angebotsstufe hinzufügen
            </Button>
            
            <div>
              <Label htmlFor="maxAmount">Maximalbetrag (€) für alle Stufen (optional)</Label>
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
          </CardContent>
        </Card>
      );
    } else {
      // Render single calculation section
      return (
        <Card>
          <CardHeader>
            <CardTitle>Berechnungsgrundlage</CardTitle>
            <CardDescription>Soll ein Preisnachlass im gegebenen Regelfall und bei der gewählten Strategie gewährt werden, wird hier definiert, wie dieser berechnet wird.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              {formData.calculationBase === 'keine_berechnung' && (formData.maxAmount === undefined || formData.maxAmount === null) && (
                <Alert className="mt-2">
                  <AlertDescription>
                    Bei 'Keine Berechnung' ist eine Rücksprache mit Partner erforderlich.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {(formData.calculationBase === 'prozent_vom_vk' || formData.calculationBase === 'fester_betrag') && (
              <div>
                <Label htmlFor="value">
                  {formData.calculationBase === 'prozent_vom_vk' ? 'Prozentsatz' : 'Betrag (€)'}
                </Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="value" 
                    type="number" 
                    value={formData.value || ''} 
                    onChange={(e) => handleChange("value", parseFloat(e.target.value))}
                    min={0}
                  />
                  <div className="text-lg font-medium w-6">
                    {formData.calculationBase === 'prozent_vom_vk' ? '%' : '€'}
                  </div>
                </div>
              </div>
            )}
            
            {formData.calculationBase === 'preisstaffel' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Preisstaffelung</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => handleAddPriceThreshold(e)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Staffel hinzufügen
                  </Button>
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
                          onChange={(e) => handlePriceThresholdChange(index, "minPrice", parseFloat(e.target.value))}
                          min={0}
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
                            handlePriceThresholdChange(index, "maxPrice", value);
                          }}
                          min={threshold.minPrice + 1}
                          placeholder="Unbegrenzt"
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
                          onChange={(e) => handlePriceThresholdChange(index, "value", parseFloat(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div className="w-20">
                        <Label htmlFor={`valueType-${index}`}>Art</Label>
                        <Select
                          value={threshold.valueType || 'percent'}
                          onValueChange={(value: ThresholdValueType) => 
                            handlePriceThresholdChange(index, "valueType", value)
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
                            handlePriceThresholdChange(index, "roundingRule", value)
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
                        onClick={() => handleRemovePriceThreshold(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!formData.priceThresholds || formData.priceThresholds.length === 0) && (
                  <Button type="button" variant="outline" onClick={(e) => handleAddPriceThreshold(e)}>
                    <Plus className="h-4 w-4 mr-2" /> Erste Staffel hinzufügen
                  </Button>
                )}
              </div>
            )}
            
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
          </CardContent>
        </Card>
      );
    }
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
          <CardDescription>Hier wird der Fall definiert, für welchen eine Preisnachlassregel erstellt werden soll. Jeder Merchant kann eine beliebige Anzahl an Regeln zu einer beliebigen Anzahl an Fällen definieren.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Regelname (optional)</Label>
            <Input 
              id="name" 
              value={formData.name}
