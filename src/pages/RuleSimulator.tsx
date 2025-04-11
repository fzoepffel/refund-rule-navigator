
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RuleCalculator from '../components/RuleCalculator';
import DiscountRuleSimulator from '../components/DiscountRuleSimulator';

// Sample rules for demonstration
const sampleRules = [
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
          <RuleCalculator rule={sampleRules[0]} />
          
          {/* Multiple Rules Simulator */}
          <DiscountRuleSimulator rules={sampleRules} />
        </div>
      </div>
    </div>
  );
};

export default RuleSimulator;
