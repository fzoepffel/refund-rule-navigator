import React, { useState } from "react";
import { DiscountRule, Trigger } from "../models/ruleTypes";
import { 
  getCalculationBaseLabel, 
  getRoundingRuleLabel,
  getThresholdValueTypeLabel,
  getTriggerLabel,
  generateRuleName
} from "../utils/discountUtils";
import { 
  Paper, 
  Text, 
  Group, 
  Stack, 
  Button, 
  ActionIcon, 
  Badge, 
  Box,
  Alert,
  Modal
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconInfoCircle } from '@tabler/icons-react';

interface RuleListProps {
  rules: DiscountRule[];
  onSelectRule: (rule: DiscountRule) => void;
  onEditRule: (rule: DiscountRule) => void;
  onDeleteRule: (id: string) => void;
  onCreateRule: () => void;
  selectedRuleId?: string;
}

const RuleList: React.FC<RuleListProps> = ({ 
  rules, 
  onSelectRule, 
  onEditRule, 
  onDeleteRule, 
  onCreateRule,
  selectedRuleId
}) => {
  // Add state for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // Add handler for delete confirmation
  const handleDeleteClick = (e: React.MouseEvent, ruleId: string) => {
    e.stopPropagation();
    setRuleToDelete(ruleId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (ruleToDelete) {
      onDeleteRule(ruleToDelete);
      setDeleteModalOpen(false);
      setRuleToDelete(null);
    }
  };

  // Helper function to format package opened status
  const getPackageOpenedLabel = (packageOpened?: 'yes' | 'no' | 'Egal') => {
    if (!packageOpened || packageOpened === 'Egal') return '';
    return packageOpened === 'yes' ? 'Ja' : 'Nein';
  };

  // Helper function to get shipping type in German
  const getShippingTypeLabel = (shippingType: string) => {
    switch(shippingType) {
      case 'paket': return 'Paket';
      case 'spedition': return 'Spedition';
      case 'Egal': return '';
      default: return shippingType;
    }
  };

  // Helper function to render discount information based on calculation base
  const renderDiscountInfo = (rule: DiscountRule) => {

    switch (rule.calculationBase) {
      case 'prozent_vom_vk':
        return <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>{rule.value}%{rule.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(rule.roundingRule)}`}</Badge>;
      case 'fester_betrag':
        return <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>{rule.value}€ Festbetrag{rule.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(rule.roundingRule)}`}</Badge>;
      case 'preisstaffel':
        if (!rule.priceThresholds || rule.priceThresholds.length === 0) return null;
        return (
          <Group gap="xs" wrap="wrap">
            {rule.priceThresholds.map((threshold, idx) => (
              <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} key={idx} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
                {threshold.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(threshold.roundingRule)}`}
              </Badge>
            ))}
          </Group>
        );
      case 'angebotsstaffel':
        if (!rule.discountLevels || rule.discountLevels.length === 0) return null;
        return (
          <Group gap="xs" wrap="wrap">
            {rule.discountLevels.map((level, idx, arr) => (
              <React.Fragment key={idx}>
                <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                  {level.value}{getThresholdValueTypeLabel(level.valueType)}
                  {level.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(level.roundingRule)}`}
                </Badge>
                {idx < arr.length - 1 && <Text span style={{ fontSize: 18 }}>→</Text>}
              </React.Fragment>
            ))}
          </Group>
        );
      default:
        return null;
    }
  };

  // Helper function to generate context info parts as an array
  const getContextInfoParts = (rule: DiscountRule) => {
    const parts = [];
    
    if (rule.triggers.length > 0) {
      parts.push(
        <Group key="trigger" gap="xs" wrap="nowrap">
          <Text span style={{ fontSize: 18 }}  fw={500}>Gründe:</Text>
          <Text span style={{ fontSize: 18 }} >{getTriggerLabels(rule.triggers)}</Text>
        </Group>
      );
    }
    
    const packageOpenedLabel = getPackageOpenedLabel(rule.packageOpened);
    if (packageOpenedLabel) {
      parts.push(
        <Group key="packageOpened" gap="xs" wrap="nowrap">
          <Text span style={{ fontSize: 18 }}  fw={500}>Originalverpackt?:</Text>
          <Text span style={{ fontSize: 18 }} >{packageOpenedLabel}</Text>
        </Group>
      );
    }
    
    const shippingTypeLabel = getShippingTypeLabel(rule.shippingType);
    if (shippingTypeLabel) {
      parts.push(
        <Group key="shippingType" gap="xs" wrap="nowrap">
          <Text span style={{ fontSize: 18 }}  fw={500}>Versandart:</Text>
          <Text span style={{ fontSize: 18 }} >{shippingTypeLabel}</Text>
        </Group>
      );
    }

    return parts;
  };

  const getTriggerLabels = (triggers: Trigger[]) => {
    const mangelTriggers: Trigger[] = [
      'Artikel beschädigt/funktioniert nicht mehr',
      'Versandverpackung und Artikel beschädigt',
      'Teile oder Zubehör fehlen',
      'Falscher Artikel'
    ];

    // Check if all Mangel triggers are selected
    const allMangelTriggersSelected = mangelTriggers.every(trigger => triggers.includes(trigger));
    
    // If all Mangel triggers are selected, only show "Mangel"
    if (allMangelTriggersSelected) {
      return triggers
        .filter(trigger => !mangelTriggers.includes(trigger) && trigger !== 'Mangel') // Remove both Mangel and its triggers
        .concat(['Mangel']) // Add Mangel once
        .map(trigger => getTriggerLabel(trigger))
        .join(", ");
    }
    
    // Otherwise, show only the specific triggers that are selected
    return triggers
      .filter(trigger => trigger !== 'Mangel') // Remove "Mangel" if it exists
      .map(trigger => getTriggerLabel(trigger))
      .join(", ");
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text style={{ fontSize: 24, fontWeight: 500 }}>Preisnachlassregeln</Text>
        <Button 
          variant="subtle" 
          color="blue"
          onClick={onCreateRule}
          style={{ fontSize: 20, fontWeight: 400 }}
          h={50}
        >
          Regel hinzufügen
        </Button>
      </Group>
      
      <Stack gap="xs">
        {rules.length === 0 ? (
          <Alert 
            color="blue" 
            icon={<IconInfoCircle size={20} />} 
            title="Keine Regeln hinterlegt"
            styles={{
              message: {
                fontSize: '20px', // Adjust to your desired size
              },
              title: {
                fontSize: '20px', // Adjust to your desired size
              },
            }}>
              Es wurden noch keine Regeln für Ihren Shop hinterlegt. 
              Zur Erstellung einer neuen Regel klicken Sie den Button "Regel hinzufügen".
          </Alert>
        ) : (
          rules.map(rule => (
            <Paper 
              key={rule.id}
              p="md"
              withBorder
              style={{ 
                cursor: 'pointer',
                backgroundColor: rule.id === selectedRuleId ? '#f0f7ff' : '#F1F3F5',
                borderColor: rule.id === selectedRuleId ? '#0563C1' : undefined,
                borderWidth: rule.id === selectedRuleId ? 2 : 1
              }}
              onClick={() => onSelectRule(rule)}
            >
              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20 }} mb="xs">{generateRuleName(rule)}</Text>
                  
                  {/* Context information line with dynamic separator dots */}
                  {/* <Group gap="xs" wrap="wrap" mt="xxxxs">
                    {getContextInfoParts(rule).map((part, index, array) => (
                      <React.Fragment key={`fragment-${index}`}>
                        {part}
                        {index < array.length - 1 && <Text span  style={{ fontSize: 18 }}></Text>}
                      </React.Fragment>
                    ))}
                  </Group> */}

                  {/* Calculation information */}
                  <Stack gap="xs" mt="xxxxs">
                    <Group gap="xs" mt="xxxxs">
                      <Text style={{ fontSize: 18 }}  fw={500}>Berechnung:</Text>
                      {rule.hasMultipleStages ? (
                        <Text style={{ fontSize: 18 }} >Mehrere Angebotsstufen</Text>
                      ) : (
                        <Text style={{ fontSize: 18 }} >{getCalculationBaseLabel(rule.calculationBase)}</Text>
                      )}
                    </Group>
                    {rule.hasMultipleStages && (
                      <Stack gap="xs" mt="xxxxs">
                        {rule.calculationStages?.map((stage, idx) => (
                          <Group key={idx} gap="xs" mt="xxxxs">
                            <Text style={{ fontSize: 18 }}  fw={500}>Stufe {idx + 1}:</Text>
                            <Box>
                              {stage.calculationBase === 'prozent_vom_vk' && (
                                <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                                  {stage.value}%{stage.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(stage.roundingRule)}`}
                                </Badge>
                              )}
                              {stage.calculationBase === 'fester_betrag' && (
                                <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                                  {stage.value}€ Festbetrag{stage.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(stage.roundingRule)}`}
                                </Badge>
                              )}
                              {stage.calculationBase === 'preisstaffel' && stage.priceThresholds && (
                                <Group gap="xs" wrap="wrap" mt="xxxxs">
                                  {stage.priceThresholds.map((threshold, tIdx) => (
                                    <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} key={tIdx} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                                      {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                                      {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
                                      {threshold.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(threshold.roundingRule)}`}
                                    </Badge>
                                  ))}
                                </Group>
                              )}
                            </Box>
                          </Group>
                        ))}
                      </Stack>
                    )}
                  </Stack>

                  {/* Discount details */}
                  {!rule.hasMultipleStages && (
                    <Box mt="xs">
                      {renderDiscountInfo(rule)}
                    </Box>
                  )}

                  {/* Max amount if exists */}
                  {rule.maxAmount && (
                    <Box mt="xs">
                      <Group gap="xs" wrap="wrap">
                        <Text span style={{ fontSize: 18 }}  fw={500}>Max:</Text>
                        <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>{rule.maxAmount}€</Badge>
                      </Group>
                      </Box>
                  )}
                  
                  {/* Special rules and notes */}
                  <Stack gap="xs" mt="md">
                    {/* Special rules display */}
                    {
                      rule.consultPartnerBeforePayout && (
                      <Group gap="xs" wrap="wrap">
                        <Text span style={{ fontSize: 18 }}  fw={500}>Rücksprache vor Auszahlung:</Text>
                        {rule.consultPartnerBeforePayout && <Text style={{ fontSize: 18 }}  >Ja</Text>}
                      </Group>
                    )}
                    
                    {/* Notes display */}
                    {rule.notes && (
                      <Text style={{ fontSize: 18 }} >
                        <Text span style={{ fontSize: 18 }} fw={500}>Notizen:</Text>{' '}
                        <Text span style={{ 
                          fontSize: 18,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {rule.notes}
                        </Text>
                      </Text>
                    )}
                  </Stack>
                </Box>
                <Group>
                  <ActionIcon 
                    variant="subtle" 
                    color="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRule(rule);
                    }}
                  >
                    <IconEdit size={20} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="subtle" 
                    color="blue"
                    onClick={(e) => handleDeleteClick(e, rule.id)}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))
        )}
      </Stack>

      {/* Add the confirmation modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Regel löschen"
        centered
        styles={{
          title: {
            fontSize: '20px',
            fontWeight: 500
          }
        }}
      >
        <Stack>
          <Text style={{ fontSize: 18 }}>
            Wollen Sie diese Regel wirklich löschen?
          </Text>
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              style={{ fontSize: 18 }}
              
            >
              Abbrechen
            </Button>
            <Button
              color="blue"
              onClick={handleConfirmDelete}
              style={{ fontSize: 18 }}
            >
              Löschen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default RuleList;
