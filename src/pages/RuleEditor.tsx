
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RuleForm from '../components/RuleForm';
import { DiscountRule } from '../models/ruleTypes';

// Sample data - in a real application, this would come from an API
const sampleRules: DiscountRule[] = [
  {
    id: '1',
    name: 'Paket_Preisnachlass gewünscht_Artikel beschädigt/funktioniert nicht mehr',
    requestType: 'Preisnachlass gewünscht',
    triggers: ['Artikel beschädigt/funktioniert nicht mehr'],
    calculationBase: 'prozent_vom_vk',
    roundingRule: 'keine_rundung',
    costCenter: 'merchant',
    returnHandling: 'keine_retoure',
    shippingType: 'paket',
    value: 10,
    returnStrategy: 'discount_then_return',
  },
  {
    id: '2',
    name: 'Spedition_Artikel zurücksenden_Falscher Artikel',
    requestType: 'Artikel zurücksenden',
    triggers: ['Falscher Artikel'],
    calculationBase: 'fester_betrag',
    roundingRule: 'auf_5_euro',
    costCenter: 'check24',
    returnHandling: 'automatisches_label',
    shippingType: 'spedition',
    value: 20,
    returnStrategy: 'auto_return_full_refund',
  },
];

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
    // Here you would save the rule to your backend
    
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
