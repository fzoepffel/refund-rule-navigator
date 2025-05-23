import React, { useState } from "react";
import RuleList from "../components/RuleList";
import RuleDetail from "../components/RuleDetail";
import RuleForm from "../components/RuleForm";
import RuleCalculator from "../components/RuleCalculator";
import { DiscountRule } from "../models/ruleTypes";
import { sampleRules } from "../data/sampleRules";
import { useToast } from "@/hooks/use-toast";
import { 
  Container, 
  Stack,
  Box
} from '@mantine/core';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { generateRuleName } from "@/utils/discountUtils";

type ViewState = {
  type: "list" | "detail" | "form";
  selectedRule?: DiscountRule;
};

const Index = () => {
  const [rules, setRules] = useState<DiscountRule[]>(sampleRules);
  const [viewState, setViewState] = useState<ViewState>({ type: "list" });
  const { toast } = useToast();
  
  const handleSelectRule = (rule: DiscountRule) => {
    setViewState({ type: "list" });
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
        description: `Die Regel "${generateRuleName(rule)}" wurde erfolgreich aktualisiert.`,
        duration: 3000
      });
    } else {
      setRules([...rules, rule]);
      toast({
        title: "Neue Regel erstellt",
        description: `Die Regel "${generateRuleName(rule)}" wurde erfolgreich erstellt.`,
        duration: 3000
      });
    }
    
    setViewState({ type: "list" });
  };
  
  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    setViewState({ type: "list" });
    toast({
      title: "Regel gelöscht",
      description: "Die Regel wurde erfolgreich gelöscht.",
      duration: 3000
    });
  };
  
  const handleBackToList = () => {
    setViewState({ type: "list" });
  };

  const handleSelectOverlappingRule = (rule: DiscountRule) => {
    setViewState({ type: "list", selectedRule: rule });
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Box style={{ width: 260, minWidth: 260 }}>
          <Sidebar />
        </Box>
        <Box style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <Container size="xl" py="xl" style={{ width: '100%', maxWidth: 900 }}>
            <Stack gap="xl">
              {viewState.type === "list" && (
                <RuleList 
                  rules={rules} 
                  onSelectRule={handleSelectRule}
                  onEditRule={handleEditRule}
                  onDeleteRule={handleDeleteRule}
                  onCreateRule={handleCreateRule}
                  selectedRuleId={viewState.selectedRule?.id}
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
                  existingRules={rules}
                  onSave={handleSaveRule}
                  onCancel={handleBackToList}
                  onSelectOverlappingRule={handleSelectOverlappingRule}
                />
              )}

              {viewState.type === "detail" && viewState.selectedRule && (
                <RuleCalculator rule={viewState.selectedRule} />
              )}
            </Stack>
          </Container>
        </Box>
      </div>
    </>
  );
};

export default Index;
