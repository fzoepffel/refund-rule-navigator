
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Activity, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RuleCalculatorProps {
  rule: DiscountRule;
}

const RuleCalculator: React.FC<RuleCalculatorProps> = ({ rule }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [discountAmount, setDiscountAmount] = useState<number | string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [currentDiscountLevel, setCurrentDiscountLevel] = useState<number>(0);
  const { toast } = useToast();
  
  const handleCalculate = () => {
    // Reset discount level when calculating a new discount
    setCurrentDiscountLevel(0);
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
  
  const handleReject = () => {
    // Only for rules with multiple discount levels
    if (rule.calculationBase === 'angebotsstaffel' && rule.discountLevels) {
      // Try to offer the next higher discount level
      const nextLevel = currentDiscountLevel + 1;
      if (nextLevel < rule.discountLevels.length) {
        // Calculate new discount amount based on the next level
        const nextLevelPercentage = rule.discountLevels[nextLevel];
        const newAmount = (salePrice * nextLevelPercentage) / 100;
        
        // Apply max amount limit if it exists
        const finalAmount = rule.maxAmount && newAmount > rule.maxAmount 
          ? rule.maxAmount 
          : newAmount;
          
        setDiscountAmount(finalAmount);
        setCurrentDiscountLevel(nextLevel);
        
        toast({
          title: "Angebot erhöht",
          description: `Nachlass auf ${nextLevelPercentage}% erhöht.`
        });
      } else {
        toast({
          title: "Maximaler Nachlass erreicht",
          description: "Es sind keine höheren Nachlass-Stufen verfügbar.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Keine weiteren Angebotsstufen",
        description: "Bei dieser Regel sind keine gestaffelten Angebote verfügbar.",
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
                
                {/* Show reject button only for angebotsstaffel rules with multiple levels */}
                {rule.calculationBase === 'angebotsstaffel' && rule.discountLevels && 
                  currentDiscountLevel < rule.discountLevels.length - 1 && (
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Ablehnen
                  </Button>
                )}
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
