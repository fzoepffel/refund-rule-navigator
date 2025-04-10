
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Euro } from "lucide-react";

const DiscountRuleSimulator: React.FC<{ rules: DiscountRule[] }> = ({ rules }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [results, setResults] = useState<{ rule: DiscountRule; amount: number }[]>([]);
  
  const handleSimulate = () => {
    const calculatedResults = rules.map(rule => ({
      rule,
      amount: calculateDiscount(salePrice, rule)
    })).sort((a, b) => b.amount - a.amount);
    
    setResults(calculatedResults);
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
            <div className="grid grid-cols-[1fr_auto] gap-2">
              {results.map(({ rule, amount }, index) => (
                <React.Fragment key={rule.id}>
                  <div className="truncate">{rule.name}</div>
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
