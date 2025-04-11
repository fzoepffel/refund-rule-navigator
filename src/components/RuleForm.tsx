import React, { useState } from "react";
import { DiscountRule, Trigger, CalculationBase, RoundingRule, CostCenter, ReturnHandling } from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getCostCenterLabel, 
  getReturnHandlingLabel 
} from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface RuleFormProps {
  rule?: DiscountRule;
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
}

const defaultRule: DiscountRule = {
  id: "",
  name: "",
  triggers: ["widerruf"],
  calculationBase: "prozent_vom_vk",
  roundingRule: "keine_rundung",
  costCenter: "merchant",
  returnHandling: "keine_retoure",
  value: 10
};

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DiscountRule>(rule || { ...defaultRule, id: Date.now().toString() });
  
  const triggers: Trigger[] = [
    'widerruf', 
    'reklamation',
    'beschaedigte_ware_leicht', 
    'beschaedigte_ware_mittel',
    'beschaedigte_ware_schwer',
    'beschaedigte_ware_unbrauchbar',
    'fehlende_teile', 
    'geschmackssache', 
    'sonstiges'
  ];
  const calculationBases: CalculationBase[] = ['prozent_vom_vk', 'fester_betrag', 'preisstaffel', 'angebotsstaffel'];
  const roundingRules: RoundingRule[] = ['keine_rundung', 'auf_5_euro', 'auf_10_euro', 'auf_10_cent'];
  const costCenters: CostCenter[] = ['merchant', 'check24'];
  const returnHandlings: ReturnHandling[] = ['automatisches_label', 'manuelles_label', 'zweitverwerter', 'keine_retoure'];
  
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
  
  const handleAddPriceThreshold = () => {
    const thresholds = formData.priceThresholds || [];
    const lastThreshold = thresholds[thresholds.length - 1];
    const newMin = lastThreshold ? (lastThreshold.maxPrice || lastThreshold.minPrice + 1) : 0;
    
    setFormData(prev => ({
      ...prev,
      priceThresholds: [
        ...(prev.priceThresholds || []),
        { minPrice: newMin, value: 10 }
      ]
    }));
  };
  
  const handleRemovePriceThreshold = (index: number) => {
    setFormData(prev => ({
      ...prev,
      priceThresholds: prev.priceThresholds?.filter((_, i) => i !== index)
    }));
  };
  
  const handlePriceThresholdChange = (index: number, field: keyof typeof formData.priceThresholds[0], value: any) => {
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
    onSave(formData);
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
            <Label htmlFor="name">Regelname</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => handleChange("name", e.target.value)} 
              placeholder="z.B. Standard Widerruf bis 50€"
              required
            />
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Anlässe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {triggers.map(trigger => (
              <div key={trigger} className="flex items-center gap-2">
                <Checkbox 
                  id={`trigger-${trigger}`} 
                  checked={formData.triggers.includes(trigger)}
                  onCheckedChange={() => toggleTrigger(trigger)}
                />
                <Label htmlFor={`trigger-${trigger}`}>
                  {getTriggerLabel(trigger)}
                </Label>
              </div>
            ))}
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
                <div key={index} className="grid grid-cols-[1fr_1fr_auto_1fr_auto] items-center gap-2">
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
                    <Label htmlFor={`value-${index}`}>
                      {formData.calculationBase === 'prozent_vom_vk' ? 'Prozent' : 'Betrag (€)'}
                    </Label>
                    <Input 
                      id={`value-${index}`} 
                      type="number" 
                      value={threshold.value} 
                      onChange={(e) => handlePriceThresholdChange(index, "value", parseFloat(e.target.value))}
                      min={0}
                    />
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
                  onCheckedChange={(checked) => handleChange("consultPartnerBeforePayout", checked)}
                />
                <Label htmlFor="consultPartnerBeforePayout">
                  Rücksprache mit Partner vor Auszahlung
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
