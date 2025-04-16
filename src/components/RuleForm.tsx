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
  DiscountLevel
} from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getRequestTypeLabel,
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getReturnHandlingLabel,
  getThresholdValueTypeLabel
} from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  value: 10
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DiscountRule>(rule || { 
    ...defaultRule, 
    id: Date.now().toString(),
    requestCategory: 'Reklamation' // Set default
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
    { value: 'discount_then_keep', label: 'Preisnachlass anbieten, bei Ablehnung volle Erstattung ohne Rücksendung' }
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

    // Part 2: Versandart
    if (formData.shippingType !== "Egal") {
      parts.push(formData.shippingType === "paket" ? "Paket" : "Spedition");
    } else {
      parts.push("Alle Versandarten");
    }

    // Part 3: Paket geöffnet
    if (formData.packageOpened === "yes") {
      parts.push("Paket geöffnet");
    } else if (formData.packageOpened === "no") {
      parts.push("Paket nicht geöffnet");
    }

    // Part 4: Gewünschte Vorgehensweise (nur bei Egal oder Reklamation)
    if ((formData.requestCategory === "Egal" || formData.requestCategory === "Reklamation") && 
        formData.requestType !== "Egal") {
      parts.push(formData.requestType);
    }

    // Part 5: Grund
    if (formData.triggers.length > 0 && formData.triggers[0] !== "Egal") {
      parts.push(formData.triggers[0]);
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
  
  // Effect to handle setting a full refund when auto_return_full_refund is selected
  useEffect(() => {
    if (formData.returnStrategy === 'auto_return_full_refund') {
      setFormData(prev => ({
        ...prev,
        calculationBase: 'fester_betrag',
        value: 100,
        returnHandling: 'automatisches_label'
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
  
  const handleAddPriceThreshold = () => {
    const thresholds = formData.priceThresholds || [];
    const lastThreshold = thresholds[thresholds.length - 1];
    const newMin = lastThreshold ? (lastThreshold.maxPrice || lastThreshold.minPrice + 1) : 0;
    
    setFormData(prev => ({
      ...prev,
      priceThresholds: [
        ...(prev.priceThresholds || []),
        { minPrice: newMin, value: 10, valueType: 'percent' }
      ]
    }));
  };
  
  const handleRemovePriceThreshold = (index: number) => {
    setFormData(prev => ({
      ...prev,
      priceThresholds: prev.priceThresholds?.filter((_, i) => i !== index)
    }));
  };
  
  const handlePriceThresholdChange = (index: number, field: keyof PriceThreshold, value: any) => {
    setFormData(prev => {
      const thresholds = [...(prev.priceThresholds || [])];
      thresholds[index] = { ...thresholds[index], [field]: value };
      return { ...prev, priceThresholds: thresholds };
    });
  };
  
  const handleAddDiscountLevel = () => {
    setFormData(prev => ({
      ...prev,
      discountLevels: [
        ...(prev.discountLevels || []),
        { value: 10, valueType: 'percent' }
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
      <div className="space-y-2">
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
        
        <div className="flex items-center flex-wrap gap-2">
          {(formData.discountLevels || []).map((level, index) => (
            <div key={index} className="flex items-center gap-1">
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
          ))}
          
          {(!formData.discountLevels || formData.discountLevels.length === 0) && (
            <Button type="button" variant="outline" onClick={handleAddDiscountLevel}>
              <Plus className="h-4 w-4 mr-2" /> Erste Stufe hinzufügen
            </Button>
          )}
        </div>
      </div>
    );
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
          <CardTitle>Grundinformationen</CardTitle>
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

          {/* Gewünschte Vorgehensweise - only show when requestCategory is Reklamation */}
          {formData.requestCategory === 'Reklamation' && (
            <div>
              <Label htmlFor="requestType">Gewünschte Vorgehensweise</Label>
              <Select 
                value={formData.requestType} 
                onValueChange={(value: RequestType) => handleChange("requestType", value)}
              >
                <SelectTrigger id="requestType">
                  <SelectValue placeholder="Vorgehensweise auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Grund */}
          <div>
            <Label htmlFor="triggers">Grund</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  id="triggers"
                >
                  <span>{getSelectedTriggerLabel()}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Grund auswählen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={formData.triggers[0]} 
                  onValueChange={(value: string) => setTrigger(value as Trigger)}
                >
                  {triggers.map(trigger => (
                    <DropdownMenuRadioItem
                      key={trigger}
                      value={trigger}
                    >
                      {trigger}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
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
          
          {/* Paket geöffnet? */}
          <div>
            <Label htmlFor="packageOpened">Paket geöffnet?</Label>
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
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
