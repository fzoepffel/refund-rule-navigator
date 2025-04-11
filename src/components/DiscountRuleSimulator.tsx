
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Euro, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface SimulatorResult {
  rule: DiscountRule;
  amount: number | string;
  message?: string;
  isReturnRequired?: boolean;
  hasError?: boolean;
}

const DiscountRuleSimulator: React.FC<{ rules: DiscountRule[] }> = ({ rules }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [results, setResults] = useState<SimulatorResult[]>([]);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  const handleSimulate = () => {
    // Update request counts for each rule
    const newRequestCounts = { ...requestCounts };
    rules.forEach(rule => {
      newRequestCounts[rule.id] = (newRequestCounts[rule.id] || 0) + 1;
    });
    setRequestCounts(newRequestCounts);
    
    const calculatedResults = rules.map(rule => {
      const requestCount = newRequestCounts[rule.id];
      
      // Handle different return strategies
      if (rule.returnStrategy === 'auto_return_full_refund') {
        return {
          rule,
          amount: salePrice,
          message: 'Automatische Retoure',
          isReturnRequired: true
        };
      }
      
      if (rule.returnStrategy === 'discount_then_keep') {
        // Always offer discount, even after multiple requests
        const amount = calculateDiscount(salePrice, rule);
        
        if (typeof amount === 'string') {
          toast({
            title: "Fehler bei der Berechnung",
            description: `Bei Regel "${rule.name}" konnte der Nachlassbetrag nicht berechnet werden.`,
            variant: "destructive",
          });
          return {
            rule,
            amount,
            message: '',
            isReturnRequired: false,
            hasError: true
          };
        }
        
        return {
          rule,
          amount,
          message: amount >= salePrice ? 'Keine Retoure' : '',
          isReturnRequired: false
        };
      }
      
      if (rule.returnStrategy === 'discount_then_return') {
        // Check if there are discount levels defined
        if (rule.discountLevels && rule.discountLevels.length > 0) {
          // If we've exhausted all levels, process full refund with return
          if (requestCount > rule.discountLevels.length) {
            return {
              rule,
              amount: salePrice,
              message: 'Retoure erforderlich',
              isReturnRequired: true
            };
          }
          
          // Otherwise use the current level
          const levelIndex = requestCount - 1;
          const discountPercent = rule.discountLevels[levelIndex];
          const amount = (salePrice * discountPercent) / 100;
          
          return {
            rule,
            amount,
            message: `Stufe ${requestCount}/${rule.discountLevels.length}: ${discountPercent}%`,
            isReturnRequired: false
          };
        }
        
        // If no levels are defined, use default behavior
        if (requestCount > 1) {
          return {
            rule,
            amount: salePrice,
            message: 'Retoure erforderlich',
            isReturnRequired: true
          };
        }
      }
      
      // First request or default case - calculate normal discount
      const amount = calculateDiscount(salePrice, rule);
      
      if (typeof amount === 'string') {
        toast({
          title: "Fehler bei der Berechnung",
          description: `Bei Regel "${rule.name}" konnte der Nachlassbetrag nicht berechnet werden.`,
          variant: "destructive",
        });
        return {
          rule,
          amount,
          message: '',
          isReturnRequired: false,
          hasError: true
        };
      }
      
      return { rule, amount, message: '', isReturnRequired: false };
    });
    
    // Sort numeric results by amount (highest first), then string results at the end
    const sortedResults = calculatedResults.sort((a, b) => {
      if (typeof a.amount === 'string' && typeof b.amount === 'string') {
        return 0;
      } else if (typeof a.amount === 'string') {
        return 1;
      } else if (typeof b.amount === 'string') {
        return -1;
      } else {
        return b.amount - a.amount;
      }
    });
    
    setResults(sortedResults);
  };
  
  // Calculate the final price after discount
  const calculateFinalPrice = (amount: number | string): number | string => {
    if (typeof amount === 'string') {
      return amount;
    }
    return salePrice - amount;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nachlass-Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="simulator-price">Verkaufspreis (VK)</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="simulator-price" 
              type="number" 
              value={salePrice} 
              onChange={(e) => setSalePrice(parseFloat(e.target.value))}
              min={0}
            />
            <Button onClick={handleSimulate}>
              <Euro className="h-4 w-4 mr-2" /> Simulieren
            </Button>
          </div>
        </div>
        
        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="font-medium">Ergebnisse</h3>
            <div className="grid grid-cols-1 gap-y-4">
              {results.map(({ rule, amount, message, isReturnRequired, hasError }, index) => (
                <div key={rule.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      Anfrage #{requestCounts[rule.id]}
                    </span>
                  </div>
                  
                  {hasError ? (
                    <Alert variant="destructive" className="mt-1 py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Der Nachlassbetrag konnte nicht berechnet werden.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Verkaufspreis:</div>
                      <div className="font-medium text-right">{formatCurrency(salePrice)}</div>
                      
                      <div className="text-muted-foreground">Nachlass:</div>
                      <div className="font-medium text-right text-destructive">
                        -{formatCurrency(amount)}
                      </div>
                      
                      {typeof amount === 'number' && !isReturnRequired && (
                        <>
                          <div className="text-muted-foreground font-medium">Neuer Preis:</div>
                          <div className="font-bold text-right border-t pt-1">
                            {formatCurrency(calculateFinalPrice(amount))}
                          </div>
                        </>
                      )}
                      
                      {message && (
                        <div className={`col-span-2 text-xs mt-1 ${isReturnRequired ? 'text-amber-500 flex items-center' : 'text-muted-foreground'}`}>
                          {isReturnRequired && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountRuleSimulator;
