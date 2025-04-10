
import React, { useState } from "react";
import RuleList from "../components/RuleList";
import RuleDetail from "../components/RuleDetail";
import RuleForm from "../components/RuleForm";
import RuleCalculator from "../components/RuleCalculator";
import DiscountRuleSimulator from "../components/DiscountRuleSimulator";
import { DiscountRule } from "../models/ruleTypes";
import { sampleRules } from "../data/sampleRules";
import { useToast } from "@/hooks/use-toast";

type ViewState = {
  type: "list" | "detail" | "form";
  selectedRule?: DiscountRule;
};

const Index = () => {
  const [rules, setRules] = useState<DiscountRule[]>(sampleRules);
  const [viewState, setViewState] = useState<ViewState>({ type: "list" });
  const { toast } = useToast();
  
  const handleSelectRule = (rule: DiscountRule) => {
    setViewState({ type: "detail", selectedRule: rule });
  };
  
  const handleEditRule = (rule: DiscountRule) => {
    setViewState({ type: "form", selectedRule: rule });
  };
  
  const handleCreateRule = () => {
    setViewState({ type: "form" });
  };
  
  const handleSaveRule = (rule: DiscountRule) => {
    // Update or create rule
    if (rules.some(r => r.id === rule.id)) {
      setRules(rules.map(r => r.id === rule.id ? rule : r));
      toast({
        title: "Regel aktualisiert",
        description: `Die Regel "${rule.name}" wurde erfolgreich aktualisiert.`
      });
    } else {
      setRules([...rules, rule]);
      toast({
        title: "Neue Regel erstellt",
        description: `Die Regel "${rule.name}" wurde erfolgreich erstellt.`
      });
    }
    
    setViewState({ type: "detail", selectedRule: rule });
  };
  
  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    setViewState({ type: "list" });
    toast({
      title: "Regel gelöscht",
      description: "Die Regel wurde erfolgreich gelöscht."
    });
  };
  
  const handleBackToList = () => {
    setViewState({ type: "list" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 md:py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Nachlassregel-Navigator</h1>
          <p className="text-muted-foreground mt-2">Systematische Verwaltung von Preisnachlassregeln für Partner-Händler</p>
        </header>
        
        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-8">
            {viewState.type === "list" && (
              <RuleList 
                rules={rules} 
                onSelectRule={handleSelectRule}
                onEditRule={handleEditRule}
                onDeleteRule={handleDeleteRule}
                onCreateRule={handleCreateRule}
              />
            )}
            
            {viewState.type === "detail" && viewState.selectedRule && (
              <RuleDetail 
                rule={viewState.selectedRule} 
                onBack={handleBackToList}
                onEdit={handleEditRule}
              />
            )}
            
            {viewState.type === "form" && (
              <RuleForm 
                rule={viewState.selectedRule}
                onSave={handleSaveRule}
                onCancel={handleBackToList}
              />
            )}
          </div>
          
          <div className="space-y-8">
            {viewState.type === "detail" && viewState.selectedRule && (
              <RuleCalculator rule={viewState.selectedRule} />
            )}
            <DiscountRuleSimulator rules={rules} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
