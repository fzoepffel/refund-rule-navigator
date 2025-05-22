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
  Title, 
  Text, 
  SimpleGrid, 
  Paper,
  Stack,
  Group,
  Box
} from '@mantine/core';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

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
