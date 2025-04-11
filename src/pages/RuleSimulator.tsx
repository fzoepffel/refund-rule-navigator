
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        
        <Card>
          <CardHeader>
            <CardTitle>Regelrechner Simulator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Der Regelrechner erlaubt es Ihnen, verschiedene Kulanzszenarien zu simulieren und die Auswirkungen zu sehen.</p>
            
            {/* Placeholder for the rule calculator component */}
            <div className="p-8 bg-gray-100 rounded-md text-center">
              Hier würde der Regelrechner angezeigt werden
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RuleSimulator;
