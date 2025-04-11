import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Info, Settings } from 'lucide-react';
import RuleList from '../components/RuleList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DiscountRule } from '../models/ruleTypes';
import { sampleRules } from '../data/sampleRules';

const MerchantRules = () => {
  const [selectedRule, setSelectedRule] = useState<DiscountRule | null>(null);
  
  const handleSelectRule = (rule: DiscountRule) => {
    setSelectedRule(rule);
  };
  
  const handleEditRule = (rule: DiscountRule) => {
    // Navigate to edit page with rule ID
    console.log('Edit rule:', rule.id);
  };
  
  const handleDeleteRule = (id: string) => {
    // Delete rule with confirmation
    console.log('Delete rule:', id);
    
    // In a real application, we would delete via an API
    // For this demo, we'll remove from our sample rules array
    const index = sampleRules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      sampleRules.splice(index, 1);
      // Force a re-render
      setSelectedRule(null);
    }
  };
  
  const handleCreateRule = () => {
    // Navigate to create page
    console.log('Create new rule');
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Merchant Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Lülecci #BWVP</h1>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">NEU</span>
          <div className="flex-grow"></div>
          <Button variant="outline" size="sm">Merchant Center</Button>
        </div>
        
        <Tabs defaultValue="merchant-data" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="merchant-data" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Merchant Daten
            </TabsTrigger>
            <TabsTrigger value="transmission" className="flex items-center gap-2">
              <Info className="h-4 w-4" /> Übermittlung
            </TabsTrigger>
            <TabsTrigger value="shipping-data" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Versanddaten
            </TabsTrigger>
            <TabsTrigger value="provision-rates" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Provisionsraten
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="merchant-data" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Merchant Info Panels */}
              <div className="space-y-6">
                {/* Placeholder for merchant data sections */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-md font-medium">Merchant Daten</CardTitle>
                    <Button variant="ghost" size="sm">Bearbeiten</Button>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-muted-foreground">Merchant-ID</div>
                      <div>BWVP</div>
                      <div className="text-muted-foreground">Interner Hauptkontakt</div>
                      <div>-</div>
                      {/* More merchant data would go here */}
                    </div>
                  </CardContent>
                </Card>
                
                {/* More info cards would be here */}
              </div>
              
              {/* Right Column - Support Info, Rules */}
              <div className="space-y-6">
                {/* Contact Info Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-md font-medium">Kontakt</CardTitle>
                    <Button variant="ghost" size="sm">Bearbeiten</Button>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-2">
                      <div>
                        <div>Herr</div>
                        <div>Yunus Lüleci</div>
                        <div>Lüleci</div>
                        <div>Wedigweg 16</div>
                        <div>64297 Darmstadt</div>
                        <div>Deutschland</div>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <div className="text-blue-500">info@lulecihome.de</div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-blue-500">+49 163 9542104</div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Customer Support Note Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-md font-medium">Notiz für Kundensupport</CardTitle>
                    <Button variant="ghost" size="sm">Bearbeiten</Button>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Notizen für den Kundensupport hier eingeben..."
                      className="resize-none"
                      rows={3}
                    />
                  </CardContent>
                </Card>
                
                {/* Rule List Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-md font-medium">Kulanzregeln</CardTitle>
                    <div className="flex items-center gap-2">
                      <Link to="/rule-simulator">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Settings className="h-4 w-4" /> Simulator
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RuleList 
                      rules={sampleRules}
                      onSelectRule={handleSelectRule}
                      onEditRule={handleEditRule}
                      onDeleteRule={handleDeleteRule}
                      onCreateRule={handleCreateRule}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Other tab contents would go here */}
          <TabsContent value="transmission">
            <div className="p-4 text-center text-muted-foreground">
              Übermittlung content would go here
            </div>
          </TabsContent>
          
          <TabsContent value="shipping-data">
            <div className="p-4 text-center text-muted-foreground">
              Versanddaten content would go here
            </div>
          </TabsContent>
          
          <TabsContent value="provision-rates">
            <div className="p-4 text-center text-muted-foreground">
              Provisionsraten content would go here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MerchantRules;
