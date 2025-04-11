
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Euro, AlertTriangle } from "lucide-react";

interface SimulatorResult {
  rule: DiscountRule;
  amount: number | string;
  message?: string;
  isReturnRequired?: boolean;
}

const DiscountRuleSimulator: React.FC<{ rules: DiscountRule[] }> = ({ rules }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [results, setResults] = useState<SimulatorResult[]>([]);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  
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
        return {
          rule,
          amount,
          message: typeof amount === 'number' && amount >= salePrice ? 'Keine Retoure' : '',
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
            <div className="grid grid-cols-[1fr_auto] gap-y-3 gap-x-2">
              {results.map(({ rule, amount, message, isReturnRequired }, index) => (
                <React.Fragment key={rule.id}>
                  <div className="truncate flex flex-col">
                    <span>{rule.name}</span>
                    {message && (
                      <span className={`text-xs ${isReturnRequired ? 'text-amber-500 flex items-center' : 'text-muted-foreground'}`}>
                        {isReturnRequired && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {message} (Anfrage #{requestCounts[rule.id]})
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-right">{formatCurrency(amount)}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountRuleSimulator;
