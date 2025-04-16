
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { 
  getCalculationBaseLabel, 
  getRoundingRuleLabel 
} from "../utils/discountUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RuleListProps {
  rules: DiscountRule[];
  onSelectRule: (rule: DiscountRule) => void;
  onEditRule: (rule: DiscountRule) => void;
  onDeleteRule: (id: string) => void;
  onCreateRule: () => void;
}

const RuleList: React.FC<RuleListProps> = ({ 
  rules, 
  onSelectRule, 
  onEditRule, 
  onDeleteRule, 
  onCreateRule 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Regeln suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
        <Button className="flex items-center gap-2" onClick={onCreateRule}>
          <Plus className="h-4 w-4" /> Neue Regel
        </Button>
      </div>
      
      <div className="space-y-2">
        {filteredRules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Keine Regeln gefunden. Erstellen Sie eine neue Regel.
            </CardContent>
          </Card>
        ) : (
          filteredRules.map(rule => (
            <Card 
              key={rule.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onSelectRule(rule)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCalculationBaseLabel(rule.calculationBase)}, {getRoundingRuleLabel(rule.roundingRule)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRule(rule);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRule(rule.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RuleList;
