
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RuleCalculator from '../components/RuleCalculator';
import DiscountRuleSimulator from '../components/DiscountRuleSimulator';
import { DiscountRule } from '../models/ruleTypes';
import { sampleRules } from '../data/sampleRules';

// Select a few sample rules for the simulator
const simulatorRules: DiscountRule[] = [
  // Using existing rules from the sampleRules array
  sampleRules.find(rule => rule.id === "2") || sampleRules[0],
  sampleRules.find(rule => rule.id === "8") || sampleRules[1]
];

const RuleSimulator = () => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Rule Calculator */}
          <RuleCalculator rule={simulatorRules[0]} />
          
          {/* Multiple Rules Simulator */}
          <DiscountRuleSimulator rules={simulatorRules} />
        </div>
      </div>
    </div>
  );
};

export default RuleSimulator;
