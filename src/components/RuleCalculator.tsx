import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, AlertTriangle } from "lucide-react";

interface RuleCalculatorProps {
  rule: DiscountRule;
}

const RuleCalculator: React.FC<RuleCalculatorProps> = ({ rule }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [discountAmount, setDiscountAmount] = useState<number | string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  
  const handleCalculate = () => {
    const newRequestCount = requestCount + 1;
    setRequestCount(newRequestCount);
    
    // Handle different return strategies
    if (rule.returnStrategy === 'auto_return_full_refund') {
      // Automatic return with full refund
      setDiscountAmount({
        amount: salePrice,
        message: 'Automatische Retoure mit voller Kostenerstattung',
        isReturnRequired: true
      });
      return;
    }
    
    if (rule.returnStrategy === 'discount_then_keep') {
      // Always offer discount, even after multiple requests
      const amount = calculateDiscount(salePrice, rule);
      setDiscountAmount({
        amount,
        message: typeof amount === 'number' && amount >= salePrice ? 'Volle Erstattung ohne Rücksendung' : '',
        isReturnRequired: false
      });
      return;
    }
    
    if (rule.returnStrategy === 'discount_then_return') {
      // Check if there are discount levels defined
      if (rule.discountLevels && rule.discountLevels.length > 0) {
        // If we've exhausted all levels, process full refund with return
        if (newRequestCount > rule.discountLevels.length) {
          setDiscountAmount({
            amount: salePrice,
            message: 'Volle Erstattung mit Retourenanforderung',
            isReturnRequired: true
          });
          return;
        }
        
        // Otherwise use the current level
        const levelIndex = newRequestCount - 1;
        const discountPercent = rule.discountLevels[levelIndex];
        const amount = (salePrice * discountPercent) / 100;
        
        setDiscountAmount({
          amount,
          message: `Stufe ${newRequestCount} von ${rule.discountLevels.length}: ${discountPercent}% Nachlass`,
          isReturnRequired: false
        });
        return;
      }
      
      // If no levels are defined, use default behavior
      if (newRequestCount > 1) {
        setDiscountAmount({
          amount: salePrice,
          message: 'Volle Erstattung mit Retourenanforderung',
          isReturnRequired: true
        });
        return;
      }
      
      // First request - calculate normal discount
      const amount = calculateDiscount(salePrice, rule);
      setDiscountAmount({
        amount,
        message: '',
        isReturnRequired: false
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nachlass berechnen</CardTitle>
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
        
        {discountAmount !== null && (
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">Berechneter Nachlass</div>
            <div className="text-2xl font-bold">
              {typeof discountAmount === 'object' 
                ? formatCurrency(discountAmount.amount) 
                : formatCurrency(discountAmount)}
            </div>
            
            {typeof discountAmount === 'object' && discountAmount.message && (
              <div className={`mt-2 text-sm ${discountAmount.isReturnRequired ? 'text-amber-500 flex items-center justify-center' : 'text-muted-foreground'}`}>
                {discountAmount.isReturnRequired && <AlertTriangle className="h-4 w-4 mr-1" />}
                {discountAmount.message}
              </div>
            )}
            
            {typeof discountAmount === 'object' && typeof discountAmount.amount === 'number' && !discountAmount.isReturnRequired && (
              <>
                <div className="text-sm text-muted-foreground mt-2">Neuer Preis</div>
                <div className="text-lg font-medium">{formatCurrency(salePrice - discountAmount.amount)}</div>
              </>
            )}
          </div>
        )}

        {requestCount > 0 && (
          <div className="text-xs text-muted-foreground text-right mt-2">
            Anfrage #{requestCount}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCalculator;
