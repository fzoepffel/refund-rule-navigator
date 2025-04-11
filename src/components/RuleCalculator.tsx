
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
  const [offeringReturn, setOfferingReturn] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleCalculate = () => {
    // Reset states when calculating a new discount
    setCurrentDiscountLevel(0);
    setOfferingReturn(false);
    
    // If the return strategy is auto_return_full_refund, immediately offer full refund and return
    if (rule.returnStrategy === 'auto_return_full_refund') {
      setDiscountAmount(salePrice);
      setOfferingReturn(true);
      
      toast({
        title: "Vollerstattung angeboten",
        description: "Der Kunde erhält eine volle Rückerstattung und muss den Artikel zurücksenden.",
      });
    } else {
      const amount = calculateDiscount(salePrice, rule);
      setDiscountAmount(amount);
      
      if (typeof amount === 'string') {
        toast({
          title: "Berechnung nicht möglich",
          description: amount,
          variant: "destructive"
        });
      }
    }
    
    setRequestCount(prevCount => prevCount + 1);
  };
  
  const handleReject = () => {
    // Check for angebotsstaffel rules with multiple discount levels
    if (rule.calculationBase === 'angebotsstaffel' && rule.discountLevels) {
      // Try to offer the next higher discount level
      const nextLevel = currentDiscountLevel + 1;
      
      // If we have more discount levels available, show the next one
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
      } 
      // If we've exhausted all discount levels or if the return strategy is "discount_then_return"
      else if (rule.returnStrategy === 'discount_then_return' || 
              rule.returnStrategy === 'discount_then_keep') {
        // Offer full refund and return if strategy is discount_then_return
        if (rule.returnStrategy === 'discount_then_return') {
          handleFullRefundAndReturn();
        } else {
          toast({
            title: "Maximaler Nachlass erreicht",
            description: "Es sind keine höheren Nachlass-Stufen verfügbar.",
            variant: "destructive"
          });
        }
      }
    } 
    // For non-ladder rules or rules without discount levels
    else {
      // If return strategy is "discount_then_return" and we're not already offering a return
      if (rule.returnStrategy === 'discount_then_return' && !offeringReturn) {
        handleFullRefundAndReturn();
      } else {
        toast({
          title: "Keine weiteren Angebotsstufen",
          description: "Bei dieser Regel sind keine gestaffelten Angebote verfügbar.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleFullRefundAndReturn = () => {
    // Set full refund as the discount amount (100% of sale price)
    setDiscountAmount(salePrice);
    setOfferingReturn(true);
    
    toast({
      title: "Vollerstattung angeboten",
      description: "Der Kunde erhält eine volle Rückerstattung und muss den Artikel zurücksenden.",
    });
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
                <div className="text-lg font-medium">
                  {offeringReturn 
                    ? "Artikel muss zurückgesendet werden" 
                    : formatCurrency(salePrice - discountAmount)}
                </div>
                
                {/* Show reject button in the following cases:
                    1. For angebotsstaffel rules with more discount levels available
                    2. For rules with discount_then_return strategy that haven't yet offered a return
                */}
                {(
                  // For angebotsstaffel rules with more levels
                  (rule.calculationBase === 'angebotsstaffel' && 
                   rule.discountLevels && 
                   currentDiscountLevel < rule.discountLevels.length - 1) ||
                  
                  // For rules with discount_then_return strategy that haven't offered a return yet
                  (rule.returnStrategy === 'discount_then_return' && !offeringReturn)
                ) && (
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Ablehnen
                  </Button>
                )}
                
                {offeringReturn && (
                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <div className="font-medium">Retoure erforderlich</div>
                    <div className="text-sm">Der Artikel muss zurückgesendet werden.</div>
                  </div>
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
