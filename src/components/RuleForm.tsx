import React, { useState, useEffect } from "react";
import { 
  DiscountRule, 
  Trigger, 
  RequestType,
  CalculationBase, 
  RoundingRule, 
  CostCenter, 
  ReturnHandling,
  ThresholdValueType,
  PriceThreshold,
  ShippingType,
  ReturnStrategy
} from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getRequestTypeLabel,
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getCostCenterLabel, 
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RuleFormProps {
  rule?: DiscountRule;
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
}

const defaultRule: DiscountRule = {
  id: "",
  name: "",
  requestType: "Preisnachlass gewünscht",
  triggers: ["Artikel beschädigt/funktioniert nicht mehr"],
  calculationBase: "prozent_vom_vk",
  roundingRule: "keine_rundung",
  costCenter: "merchant",
  returnHandling: "keine_retoure",
  shippingType: "paket",
  returnStrategy: "discount_then_return",
  value: 10
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DiscountRule>(rule || { ...defaultRule, id: Date.now().toString() });
  
  const requestTypes: RequestType[] = [
    'Ersatzteil gewünscht',
    'Preisnachlass gewünscht',
    'Kontaktaufnahme gewünscht',
    'Artikel zurücksenden'
  ];
  
  const triggers: Trigger[] = [
    'Artikel beschädigt/funktioniert nicht mehr',
    'Versandverpackung und Artikel beschädigt',
    'Teile oder Zubehör fehlen',
    'Falscher Artikel'
  ];
  
  const calculationBases: CalculationBase[] = ['keine_berechnung', 'prozent_vom_vk', 'fester_betrag', 'preisstaffel', 'angebotsstaffel'];
  const roundingRules: RoundingRule[] = ['keine_rundung', 'auf_5_euro', 'auf_10_euro', 'auf_10_cent'];
  const costCenters: CostCenter[] = ['merchant', 'check24'];
  const returnHandlings: ReturnHandling[] = ['automatisches_label', 'manuelles_label', 'zweitverwerter', 'keine_retoure'];
  const thresholdValueTypes: ThresholdValueType[] = ['percent', 'fixed'];
  const shippingTypes: ShippingType[] = ['paket', 'spedition'];
  const returnStrategies: {value: ReturnStrategy; label: string}[] = [
    { value: 'auto_return_full_refund', label: 'Automatische Retoure mit voller Kostenerstattung' },
    { value: 'discount_then_return', label: 'Preisnachlass anbieten, bei Ablehnung Retoure' },
    { value: 'discount_then_keep', label: 'Preisnachlass anbieten, bei Ablehnung volle Erstattung ohne Rücksendung' }
  ];
  
  // Generate rule name if empty
  const generateRuleName = () => {
    if (formData.name) return formData.name;
    
    const shippingTypeLabel = formData.shippingType === "paket" ? "Paket" : "Spedition";
    const requestTypeLabel = formData.requestType;
    
    // Use the first trigger or "Unbekannt" if no triggers are selected
    let triggerLabel = "Unbekannt";
    if (formData.triggers && formData.triggers.length > 0) {
      triggerLabel = formData.triggers[0];
    }
    
    return `${shippingTypeLabel}_${requestTypeLabel}_${triggerLabel}`;
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
  
  const toggleTrigger = (trigger: Trigger) => {
    setFormData(prev => {
      const triggers = prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger];
      return { ...prev, triggers };
    });
  };
  
  const getSelectedTriggersLabel = () => {
    if (formData.triggers.length === 0) {
      return "Gründe auswählen";
    } else if (formData.triggers.length === 1) {
      return getTriggerLabel(formData.triggers[0]);
    } else {
      return `${formData.triggers.length} Gründe ausgewählt`;
    }
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
      discountLevels: [...(prev.discountLevels || []), 10]
    }));
  };
  
  const handleDiscountLevelChange = (index: number, value: number) => {
    setFormData(prev => {
      const levels = [...(prev.discountLevels || [])];
      levels[index] = value;
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestType">Art der Anfrage</Label>
              <Select 
                value={formData.requestType} 
                onValueChange={(value: RequestType) => handleChange("requestType", value)}
              >
                <SelectTrigger id="requestType">
                  <SelectValue placeholder="Art der Anfrage auswählen" />
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
            
            <div>
              <Label htmlFor="triggers">Grund</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    id="triggers"
                  >
                    <span>{getSelectedTriggersLabel()}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Gründe auswählen</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {triggers.map(trigger => (
                    <DropdownMenuCheckboxItem
                      key={trigger}
                      checked={formData.triggers.includes(trigger)}
                      onCheckedChange={() => toggleTrigger(trigger)}
                    >
                      {trigger}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div>
            <Label htmlFor="returnStrategy">Rückgabestrategie</Label>
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
          </div>
          
          <div>
            <Label htmlFor="costCenter">Kostenträger</Label>
            <Select 
              value={formData.costCenter} 
              onValueChange={(value: CostCenter) => handleChange("costCenter", value)}
            >
              <SelectTrigger id="costCenter">
                <SelectValue placeholder="Kostenträger auswählen" />
              </SelectTrigger>
              <SelectContent>
                {costCenters.map(center => (
                  <SelectItem key={center} value={center}>
                    {getCostCenterLabel(center)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="shippingType">Versandart</Label>
            <RadioGroup 
              value={formData.shippingType || 'paket'} 
              onValueChange={(value: ShippingType) => handleChange("shippingType", value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paket" id="shipping-type-paket" />
                <Label htmlFor="shipping-type-paket">Paket</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spedition" id="shipping-type-spedition" />
                <Label htmlFor="shipping-type-spedition">Spedition</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
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
              disabled={formData.returnStrategy === 'auto_return_full_refund'}
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
            <div className="space-y-2">
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
                <div key={index} className="grid grid-cols-[1fr_1fr_auto_1fr_1fr_auto] items-center gap-2 mb-4">
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
                  <div className="self-end text-lg font-medium pt-2">:</div>
                  <div>
                    <Label htmlFor={`value-${index}`}>Wert</Label>
                    <Input 
                      id={`value-${index}`} 
                      type="number" 
                      value={threshold.value} 
                      onChange={(e) => handlePriceThresholdChange(index, "value", parseFloat(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div>
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
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="self-end"
                    disabled={formData.priceThresholds?.length === 1}
                    onClick={() => handleRemovePriceThreshold(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(!formData.priceThresholds || formData.priceThresholds.length === 0) && (
                <Button type="button" variant="outline" onClick={handleAddPriceThreshold}>
                  <Plus className="h-4 w-4 mr-2" /> Erste Staffel hinzufügen
                </Button>
              )}
            </div>
          )}
          
          {formData.calculationBase === 'angebotsstaffel' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Angebotsabfolge (in %)</Label>
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
                      value={level} 
                      onChange={(e) => handleDiscountLevelChange(index, parseFloat(e.target.value))}
                      min={1}
                      max={100}
                    />
                    <span className="text-lg font-medium">%</span>
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
          )}
          
          <div>
            <Label htmlFor="roundingRule">Rundungsregel</Label>
            <Select 
              value={formData.roundingRule} 
              onValueChange={(value: RoundingRule) => handleChange("roundingRule", value)}
              disabled={formData.returnStrategy === 'auto_return_full_refund'}
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
              disabled={formData.returnStrategy === 'auto_return_full_refund'}
            />
          </div>
        </CardContent>
      </Card>
      
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
          <div className="space-y-2">
            <Label>Sonderregeln</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="checkIfProductOpened" 
                  checked={formData.checkIfProductOpened || false}
                  onCheckedChange={(checked) => handleChange("checkIfProductOpened", checked)}
                />
                <Label htmlFor="checkIfProductOpened">
                  Prüfung ob Produkt geöffnet ist
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="offerDiscountBeforeReturn" 
                  checked={formData.offerDiscountBeforeReturn || false}
                  onCheckedChange={(checked) => handleChange("offerDiscountBeforeReturn", checked)}
                />
                <Label htmlFor="offerDiscountBeforeReturn">
                  Erst Nachlass anbieten, dann Retoure
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="noReturnOnFullRefund" 
                  checked={formData.noReturnOnFullRefund || false}
                  onCheckedChange={(checked) => handleChange("noReturnOnFullRefund", checked)}
                />
                <Label htmlFor="noReturnOnFullRefund">
                  Bei voller Erstattung keine Retoure notwendig
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
                  Mindestbestellalter (Tage)
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
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Zusatzaktionen</Label>
            <div className="space-y-2">
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
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="sendInfoToPartner" 
                  checked={formData.sendInfoToPartner || false}
                  onCheckedChange={(checked) => handleChange("sendInfoToPartner", checked)}
                />
                <Label htmlFor="sendInfoToPartner">
                  Info über Gründe an Partner senden
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="requestReceiptOrProofOfPurchase" 
                  checked={formData.requestReceiptOrProofOfPurchase || false}
                  onCheckedChange={(checked) => handleChange("requestReceiptOrProofOfPurchase", checked)}
                />
                <Label htmlFor="requestReceiptOrProofOfPurchase">
                  Kaufbeleg/Nachweise anfordern
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="collectCustomerFeedback" 
                  checked={formData.collectCustomerFeedback || false}
                  onCheckedChange={(checked) => handleChange("collectCustomerFeedback", checked)}
                />
                <Label htmlFor="collectCustomerFeedback">
                  Kundenfeedback zum Produkt einholen
                </Label>
              </div>
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
        </CardContent>
      </Card>
    </form>
  );
};

export default RuleForm;
