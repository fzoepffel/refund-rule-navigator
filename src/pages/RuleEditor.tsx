
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RuleForm from '../components/RuleForm';
import { DiscountRule } from '../models/ruleTypes';
import { sampleRules } from '../data/sampleRules';

const RuleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rule, setRule] = useState<DiscountRule | undefined>(undefined);
  
  useEffect(() => {
    // If id is provided, find the rule to edit
    if (id) {
      const foundRule = sampleRules.find(r => r.id === id);
      if (foundRule) {
        setRule(foundRule);
      } else {
        // Rule not found, navigate back to rules list
        navigate('/merchant-rules');
      }
    }
  }, [id, navigate]);
  
  const handleSave = (savedRule: DiscountRule) => {
    console.log('Saving rule:', savedRule);
    
    // In a real application, we would save to an API
    // For this demo, we can simulate adding/updating to our sample rules
    if (id) {
      // Update existing rule
      const ruleIndex = sampleRules.findIndex(r => r.id === id);
      if (ruleIndex !== -1) {
        sampleRules[ruleIndex] = savedRule;
      }
    } else {
      // Add new rule
      sampleRules.push(savedRule);
    }
    
    // Navigate back to merchant rules
    navigate('/merchant-rules');
  };
  
  const handleCancel = () => {
    navigate('/merchant-rules');
  };
  
  return (
    <div className="container mx-auto p-4">
      <RuleForm 
        rule={rule}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default RuleEditor;
