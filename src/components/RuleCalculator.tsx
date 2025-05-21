import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface RuleCalculatorProps {
  rule: DiscountRule;
}

const RuleCalculator: React.FC<RuleCalculatorProps> = ({ rule }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [discountAmounts, setDiscountAmounts] = useState<number[] | null>(null);

  const calculateRefund = (price: number, stage: typeof rule.calculationStages[0]) => {
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

  const getCurrentRefund = () => {
    if (!rule.hasMultipleStages) {
      let refund = 0;
      
      switch (rule.calculationBase) {
        case 'prozent_vom_vk':
          refund = (salePrice * (rule.value || 0)) / 100;
          if (rule.roundingRule) {
            refund = applyRoundingRule(refund, rule.roundingRule);
          }
          break;
        case 'fester_betrag':
          refund = rule.value || 0;
          if (rule.roundingRule) {
            refund = applyRoundingRule(refund, rule.roundingRule);
          }
          break;
        case 'preisstaffel':
          const threshold = rule.priceThresholds?.find(t => 
            salePrice >= t.minPrice && (!t.maxPrice || salePrice <= t.maxPrice)
          );
          if (!threshold) return 0;
          refund = threshold.valueType === 'percent' 
            ? (salePrice * threshold.value) / 100 
            : threshold.value;
          if (threshold.roundingRule) {
            refund = applyRoundingRule(refund, threshold.roundingRule);
          }
          break;
        default:
          return 0;
      }

      if (rule.maxAmount && refund > rule.maxAmount) {
        return rule.maxAmount;
      }
    
      return refund;
    }

    if (!rule.calculationStages || rule.calculationStages.length === 0) return 0;
    
    let refund = calculateRefund(salePrice, rule.calculationStages[0]);
    
    if (rule.calculationStages[0].maxAmount && refund > rule.calculationStages[0].maxAmount) {
      return rule.calculationStages[0].maxAmount;
    }
    
    if (rule.maxAmount && refund > rule.maxAmount) {
      return rule.maxAmount;
    }
    
    return refund;
  };

  const getAllRefunds = () => {
    if (!rule.hasMultipleStages || !rule.calculationStages) {
      return [getCurrentRefund()];
    }

    return rule.calculationStages.map(stage => {
      let refund = calculateRefund(salePrice, stage);
      
      if (stage.maxAmount && refund > stage.maxAmount) {
        refund = stage.maxAmount;
      }
      
      if (rule.maxAmount && refund > rule.maxAmount) {
        refund = rule.maxAmount;
      }
      
      return refund;
    });
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
  
  const handleCalculate = () => {
    setDiscountAmounts(getAllRefunds());
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preisnachlass berechnen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sale-price">Verkaufspreis (VK)</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="sale-price" 
              type="number" 
              value={salePrice} 
              onChange={(e) => setSalePrice(parseFloat(e.target.value))}
              min={0}
            />
            <div className="text-lg font-medium">€</div>
          </div>
        </div>
        
        <Button onClick={handleCalculate} className="w-full">
          <Calculator className="h-4 w-4 mr-2" /> Nachlass berechnen
        </Button>
        
        {discountAmounts !== null && (
          <div className="space-y-4">
            {discountAmounts.map((amount, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(amount)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {rule.hasMultipleStages ? `Angebotener Preisnachlass (Stufe ${index + 1})` : 'Angebotener Preisnachlass'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCalculator;
