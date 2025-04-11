
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RuleCalculatorProps {
  rule: DiscountRule;
}

const RuleCalculator: React.FC<RuleCalculatorProps> = ({ rule }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [discountAmount, setDiscountAmount] = useState<number | string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const { toast } = useToast();
  
  const handleCalculate = () => {
    const amount = calculateDiscount(salePrice, rule);
    setDiscountAmount(amount);
    setRequestCount(prevCount => prevCount + 1);
    
    if (typeof amount === 'string') {
      toast({
        title: "Berechnung nicht möglich",
        description: amount,
        variant: "destructive"
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
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Berechneter Nachlass</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-1" /> 
                <span>Anfragen: {requestCount}</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(discountAmount)}</div>
            {typeof discountAmount === 'number' && (
              <>
                <div className="text-sm text-muted-foreground mt-2">Neuer Preis</div>
                <div className="text-lg font-medium">{formatCurrency(salePrice - discountAmount)}</div>
              </>
            )}
            {typeof discountAmount === 'string' && (
              <div className="mt-2 text-sm text-destructive">
                Fehler: Der Nachlass konnte nicht berechnet werden.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCalculator;
