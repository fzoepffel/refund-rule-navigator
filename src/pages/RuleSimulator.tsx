
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RuleCalculator from '../components/RuleCalculator';
import { DiscountRule } from '../models/ruleTypes';
import { sampleRules } from '../data/sampleRules';

const RuleSimulator = () => {
  const { ruleId } = useParams<{ ruleId: string }>();
  const navigate = useNavigate();
  const [selectedRule, setSelectedRule] = useState<DiscountRule | null>(null);
  
  useEffect(() => {
    // If a specific rule ID is provided, find that rule for testing
    if (ruleId) {
      const foundRule = sampleRules.find(rule => rule.id === ruleId);
      if (foundRule) {
        setSelectedRule(foundRule);
      } else {
        // Rule not found, redirect to rules page
        navigate('/merchant-rules');
      }
    } else {
      // No rule ID provided, redirect to rules page
      navigate('/merchant-rules');
    }
  }, [ruleId, navigate]);

  if (!selectedRule) {
    return <div className="p-8 text-center">Lade Regel...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/merchant-rules">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Regelrechner: {selectedRule.name}</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Rule explanation section */}
          <Card>
            <CardHeader>
              <CardTitle>Regeln für Nachlass-Anfragen</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Klicken Sie mehrmals auf "Nachlass berechnen" um zu sehen, wie sich die Nachlässe ändern.</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Regeltyp:</strong> {selectedRule.returnStrategy === 'auto_return_full_refund' ? 'Automatische Retoure' : 
                   selectedRule.returnStrategy === 'discount_then_return' ? 'Preisnachlass, dann Retoure' : 'Preisnachlass ohne Retoure'}</li>
                {selectedRule.discountLevels && selectedRule.discountLevels.length > 0 && (
                  <li>
                    <strong>Angebotsstaffelung:</strong> {selectedRule.discountLevels.map((level, idx) => 
                      `${idx+1}. Anfrage: ${level}%`).join(', ')}
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        
          {/* Individual Rule Calculator */}
          <RuleCalculator rule={selectedRule} />
        </div>
      </div>
    </div>
  );
};

export default RuleSimulator;
