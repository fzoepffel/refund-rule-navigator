
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
import { ArrowLeft, Plus, Minus, Save, ChevronDown, History, Car } from "lucide-react";
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
        { minPrice: newMin, value: 10, valueType: 'percent', roundingRule: 'keine_rundung' }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
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
      
      {/* Return Strategy in its own card */}
      <Card>
        <CardHeader>
          <CardTitle>Rückgabestrategie</CardTitle>
        </CardHeader>
        <CardContent>
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
            {formData.returnStrategy === 'auto_return_full_refund' && (
              <Alert className="mt-2">
                <AlertDescription>
                  Bei automatischer Retoure wird der Erstattungsbetrag auf vollen Verkaufspreis gesetzt.
                </AlertDescription>
              </Alert>
            )}
            {formData.returnStrategy === 'contact_merchant_immediately' && (
              <Alert className="mt-2">
                <AlertDescription>
                  Bei direkter Merchant-Kontaktierung wird keine Berechnung durchgeführt und Rücksprache ist erforderlich.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {(formData.returnStrategy !== 'auto_return_full_refund' && formData.returnStrategy !== 'contact_merchant_immediately') && (
        <Card>
          <CardHeader>
            <CardTitle>Berechnungsgrundlage</CardTitle>
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
                    onClick={handleAddPriceThreshold}
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
                  <Button type="button" variant="outline" onClick={handleAddPriceThreshold}>
                    <Plus className="h-4 w-4 mr-2" /> Erste Staffel hinzufügen
                  </Button>
                )}
              </div>
            )}
            
            {renderDiscountLevelsSection()}
            
            {formData.calculationBase !== 'preisstaffel' && formData.calculationBase !== 'angebotsstaffel' && (
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
          <CardTitle>Sonderregeln & Zusatzaktionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            

            <div className="space-y-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="previousRefundsCheck" 
                    checked={formData.previousRefundsCheck || false}
                    onCheckedChange={(checked) => handleChange("previousRefundsCheck", checked)}
                  />
                  <Label htmlFor="previousRefundsCheck" className="flex items-center gap-1">
                    <History className="h-4 w-4" />
                    Kundenhistorie prüfen (Anzahl vorheriger Rückzahlungen)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="customerLoyaltyCheck" 
                    checked={formData.customerLoyaltyCheck || false}
                    onCheckedChange={(checked) => handleChange("customerLoyaltyCheck", checked)}
                  />
                  <Label htmlFor="customerLoyaltyCheck">
                    Kundenhistorie prüfen (Bestandskunde)
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Checkbox 
                    id="minOrderAgeToDays" 
                    checked={!!formData.minOrderAgeToDays}
                    onCheckedChange={(checked) => handleChange("minOrderAgeToDays", checked ? 14 : undefined)}
                  />
                  <Label htmlFor="minOrderAgeToDays" className="flex-shrink-0">
                    Maximales Bestellungsalter (Tage)
                  </Label>
                  {formData.minOrderAgeToDays !== undefined && (
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={formData.minOrderAgeToDays}
                      onChange={(e) => handleChange("minOrderAgeToDays", parseInt(e.target.value))}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="requestPictures" 
                    checked={formData.requestPictures || false}
                    onCheckedChange={(checked) => handleChange("requestPictures", checked)}
                  />
                  <Label htmlFor="requestPictures">
                    Bilder anfordern
                  </Label>
                </div>
              </div>
            </div>
          
            <Separator className="my-2" />
          
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="isCompleteRule" 
                  checked={formData.isCompleteRule || false}
                  onCheckedChange={(checked) => handleChange("isCompleteRule", checked)}
                />
                <div>
                  <Label htmlFor="isCompleteRule" className="text-base">
                    Regel konnte komplett und eindeutig erfasst werden
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
                  disabled={formData.calculationBase === 'keine_berechnung'}
                  onCheckedChange={(checked) => handleChange("consultPartnerBeforePayout", checked)}
                />
                <Label htmlFor="consultPartnerBeforePayout" className={
                  formData.calculationBase === 'keine_berechnung' 
                    ? "text-muted-foreground" 
                    : ""
                }>
                  Rücksprache mit Partner vor Auszahlung
                  {formData.calculationBase === 'keine_berechnung' && (
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
