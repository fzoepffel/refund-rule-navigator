import React, { useState } from "react";
import { DiscountRule, Trigger } from "../models/ruleTypes";
import { 
  getCalculationBaseLabel, 
  getRoundingRuleLabel,
  getThresholdValueTypeLabel,
  getReturnStrategyLabel,
  getTriggerLabel
} from "../utils/discountUtils";
import { 
  Paper, 
  Text, 
  Group, 
  Stack, 
  Button, 
  ActionIcon, 
  Badge, 
  TextInput,
  Box,
  Flex
} from '@mantine/core';
import { IconSearch, IconFilter, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

interface RuleListProps {
  rules: DiscountRule[];
  onSelectRule: (rule: DiscountRule) => void;
  onEditRule: (rule: DiscountRule) => void;
  onDeleteRule: (id: string) => void;
  onCreateRule: () => void;
}

const RuleList: React.FC<RuleListProps> = ({ 
  rules, 
  onSelectRule, 
  onEditRule, 
  onDeleteRule, 
  onCreateRule 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
    if (!rule.customerOptions?.includes('Preisnachlass')) return null;

    switch (rule.calculationBase) {
      case 'prozent_vom_vk':
        return <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>{rule.value}%{rule.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(rule.roundingRule)}`}</Badge>;
      case 'fester_betrag':
        return <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>{rule.value}€ Festbetrag{rule.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(rule.roundingRule)}`}</Badge>;
      case 'preisstaffel':
        if (!rule.priceThresholds || rule.priceThresholds.length === 0) return null;
        return (
          <Group gap="xs" wrap="wrap">
            {rule.priceThresholds.map((threshold, idx) => (
              <Badge key={idx} size="sm" styles={{ root: { textTransform: 'none' } }}>
                {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
                {threshold.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(threshold.roundingRule)}`}
                {threshold.consultPartnerBeforePayout && (
                  <Text span c="yellow.6" ml={5} size="sm">(Merchant kontaktieren)</Text>
                )}
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
                <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>
                  {level.value}{getThresholdValueTypeLabel(level.valueType)}
                  {level.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(level.roundingRule)}`}
                </Badge>
                {idx < arr.length - 1 && <Text span size="sm">→</Text>}
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
          <Text span size="sm" c="dimmed" fw={500}>Gründe:</Text>
          <Text span size="sm" c="dimmed">{getTriggerLabels(rule.triggers)}</Text>
        </Group>
      );
    }
    
    const packageOpenedLabel = getPackageOpenedLabel(rule.packageOpened);
    if (packageOpenedLabel) {
      parts.push(
        <Group key="packageOpened" gap="xs" wrap="nowrap">
          <Text span size="sm" c="dimmed" fw={500}>Originalverpackt?:</Text>
          <Text span size="sm" c="dimmed">{packageOpenedLabel}</Text>
        </Group>
      );
    }
    
    const shippingTypeLabel = getShippingTypeLabel(rule.shippingType);
    if (shippingTypeLabel) {
      parts.push(
        <Group key="shippingType" gap="xs" wrap="nowrap">
          <Text span size="sm" c="dimmed" fw={500}>Versandart:</Text>
          <Text span size="sm" c="dimmed">{shippingTypeLabel}</Text>
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
      <Group>
        <TextInput
          placeholder="Nach Regeln suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
        />
        <Button variant="light" leftSection={<IconFilter size={16} />}>
          Filter
        </Button>
        <Button 
          variant="filled" 
          leftSection={<IconPlus size={16} />} 
          onClick={onCreateRule}
        >
          Neue Regel
        </Button>
      </Group>
      
      <Stack gap="xs">
        {filteredRules.length === 0 ? (
          <Paper p="md" withBorder>
            <Text c="dimmed" ta="center">
              Keine Regeln gefunden. Erstellen Sie eine neue Regel.
            </Text>
          </Paper>
        ) : (
          filteredRules.map(rule => (
            <Paper 
              key={rule.id}
              p="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectRule(rule)}
            >
              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="md" mb="xs">{rule.name}</Text>
                  
                  {/* Context information line with dynamic separator dots */}
                  <Group gap="xs" wrap="wrap" mt="xxxxs">
                    {getContextInfoParts(rule).map((part, index, array) => (
                      <React.Fragment key={`fragment-${index}`}>
                        {part}
                        {index < array.length - 1 && <Text span c="dimmed" size="xs"></Text>}
                      </React.Fragment>
                    ))}
                  </Group>

                  {/* Calculation information */}
                  <Stack gap="xs" mt="xxxxs">
                    <Group gap="xs" mt="xxxxs">
                      <Text size="sm" c="dimmed" fw={500}>Berechnung:</Text>
                      {rule.hasMultipleStages ? (
                        <Text size="sm" c="dimmed">Mehrere Angebotsstufen</Text>
                      ) : (
                        <Text size="sm" c="dimmed">{getCalculationBaseLabel(rule.calculationBase)}</Text>
                      )}
                    </Group>
                    {rule.hasMultipleStages && (
                      <Stack gap="xs" mt="xxxxs">
                        {rule.calculationStages?.map((stage, idx) => (
                          <Group key={idx} gap="xs" mt="xxxxs">
                            <Text size="sm" c="dimmed" fw={500}>Stufe {idx + 1}:</Text>
                            <Box>
                              {stage.calculationBase === 'prozent_vom_vk' && (
                                <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>
                                  {stage.value}%{stage.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(stage.roundingRule)}`}
                                </Badge>
                              )}
                              {stage.calculationBase === 'fester_betrag' && (
                                <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>
                                  {stage.value}€ Festbetrag{stage.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(stage.roundingRule)}`}
                                </Badge>
                              )}
                              {stage.calculationBase === 'preisstaffel' && stage.priceThresholds && (
                                <Group gap="xs" wrap="wrap" mt="xxxxs">
                                  {stage.priceThresholds.map((threshold, tIdx) => (
                                    <Badge key={tIdx} size="sm" styles={{ root: { textTransform: 'none' } }}>
                                      {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                                      {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
                                      {threshold.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(threshold.roundingRule)}`}
                                      {threshold.consultPartnerBeforePayout && (
                                        <Text span c="yellow.6" ml={5} size="sm">(Merchant kontaktieren)</Text>
                                      )}
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
                      <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Max: {rule.maxAmount}€</Badge>
                    </Box>
                  )}
                  
                  {/* Special rules and notes */}
                  <Stack gap="xs" mt="md">
                    {/* Special rules display */}
                    {(rule.requestPictures || 
                      rule.previousRefundsCheck || 
                      rule.customerLoyaltyCheck || 
                      rule.minOrderAgeToDays || 
                      rule.consultPartnerBeforePayout ||
                      rule.noReturnOnFullRefund ||
                      rule.offerDiscountBeforeReturn ||
                      rule.sendInfoToPartner) && (
                      <Group gap="xs" wrap="wrap">
                        <Text span size="sm" c="dimmed" fw={500}>Zusatzaktionen:</Text>
                        {rule.requestPictures && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Fotos anfordern</Badge>}
                        {rule.previousRefundsCheck && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Vorherige Erstattungen prüfen</Badge>}
                        {rule.customerLoyaltyCheck && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Kundentreue prüfen</Badge>}
                        {rule.minOrderAgeToDays && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Min. Bestellalter: {rule.minOrderAgeToDays} Tage</Badge>}
                        {rule.consultPartnerBeforePayout && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Rücksprache mit Partner vor Auszahlung</Badge>}
                        {rule.noReturnOnFullRefund && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Keine Rücksendung bei voller Erstattung</Badge>}
                        {rule.offerDiscountBeforeReturn && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Nachlass vor Rücksendung anbieten</Badge>}
                        {rule.sendInfoToPartner && <Badge size="sm" styles={{ root: { textTransform: 'none' } }}>Partner informieren</Badge>}
                      </Group>
                    )}
                    
                    {/* Notes display */}
                    {rule.notes && (
                      <Text size="sm" c="dimmed">
                        <Text span fw={500}>Notizen:</Text> {rule.notes}
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
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="subtle" 
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRule(rule.id);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Stack>
  );
};

export default RuleList;
