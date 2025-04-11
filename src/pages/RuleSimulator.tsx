
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RuleCalculator from '../components/RuleCalculator';
import DiscountRuleSimulator from '../components/DiscountRuleSimulator';
import { DiscountRule, CalculationBase } from '../models/ruleTypes';
import { sampleRules } from '../data/sampleRules';

const RuleSimulator = () => {
  const { ruleId } = useParams<{ ruleId: string }>();
  const navigate = useNavigate();
  const [selectedRules, setSelectedRules] = useState<DiscountRule[]>([]);
  
  useEffect(() => {
    // If a specific rule ID is provided, find that rule for testing
    if (ruleId) {
      const foundRule = sampleRules.find(rule => rule.id === ruleId);
      if (foundRule) {
        setSelectedRules([foundRule]);
      } else {
        // Rule not found, use default rules
        setDefaultRules();
      }
    } else {
      // No rule ID provided, use default rules
      setDefaultRules();
    }
  }, [ruleId]);
  
  const setDefaultRules = () => {
    // Select demo rules for the simulator
    const defaultRules: DiscountRule[] = [
      // Auto return rule
      sampleRules.find(rule => rule.returnStrategy === 'auto_return_full_refund') || sampleRules[0],
      
      // Discount then return rule 
      sampleRules.find(rule => rule.returnStrategy === 'discount_then_return') || sampleRules[1],
      
      // Find or create a rule with discount levels for testing
      (() => {
        const discountLadderRule = sampleRules.find(rule => rule.discountLevels && rule.discountLevels.length > 0);
        if (discountLadderRule) return discountLadderRule;
        
        // If no rule with discount levels exists, modify a copy of the first rule
        const modifiedRule: DiscountRule = { 
          ...sampleRules[0],
          id: "ladder_demo",
          name: "Staffelrabatt Demo",
          calculationBase: 'angebotsstaffel' as CalculationBase,
          discountLevels: [10, 25, 50], // 10%, 25%, 50%
          returnStrategy: 'discount_then_return'
        };
        return modifiedRule;
      })()
    ];
    
    setSelectedRules(defaultRules);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/merchant-rules">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Regelrechner Simulator</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Rule explanation section */}
          <Card>
            <CardHeader>
              <CardTitle>Regeln für Nachlass-Anfragen</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Der Simulator unterstützt verschiedene Rückgabestrategien:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Automatische Retoure:</strong> Sofort volle Erstattung mit Retoure</li>
                <li><strong>Preisnachlass anbieten:</strong> Erst Preisnachlass, nach mehreren Anfragen Retoure</li>
                <li><strong>Mehrstufiger Nachlass:</strong> Progressiver Nachlass bevor Retoure oder Erstattung</li>
              </ul>
              <p className="mt-4">Klicken Sie mehrmals auf "Nachlass berechnen" oder "Simulieren" um zu sehen, wie sich die Nachlässe ändern.</p>
            </CardContent>
          </Card>
        
          {/* Individual Rule Calculator - show only if a specific rule is selected */}
          {selectedRules.length === 1 && ruleId && (
            <RuleCalculator rule={selectedRules[0]} />
          )}
          
          {/* Multiple Rules Simulator */}
          <DiscountRuleSimulator rules={selectedRules} />
        </div>
      </div>
    </div>
  );
};

export default RuleSimulator;
