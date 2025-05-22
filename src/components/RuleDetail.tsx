import React from "react";
import { DiscountRule, Trigger } from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
} from "../utils/discountUtils";
import { 
  Paper, 
  Text, 
  Group, 
  Stack, 
  Button, 
  ActionIcon, 
  Badge, 
  Divider,
  Title,
  Box,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconHistory } from '@tabler/icons-react';

interface RuleDetailProps {
  rule: DiscountRule;
  onBack: () => void;
  onEdit: (rule: DiscountRule) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({ rule, onBack, onEdit }) => {
  // Check if we should show the value field
  // Don't show for preisstaffel or angebotsstaffel calculation bases
  const shouldShowValue = rule.value !== undefined && 
    rule.calculationBase !== 'preisstaffel' && 
    rule.calculationBase !== 'angebotsstaffel';

  // Determine which staffeling to show based on calculation base
  const showPriceThresholds = rule.calculationBase === 'preisstaffel' && 
    rule.priceThresholds && 
    rule.priceThresholds.length > 0;
    
  const showDiscountLevels = rule.calculationBase === 'angebotsstaffel' && 
    rule.discountLevels && 
    rule.discountLevels.length > 0;
    
  // Determine if we should show general rounding rule
  // Don't show if we have price thresholds or discount levels with individual rounding rules
  const shouldShowGeneralRounding = !showPriceThresholds && !showDiscountLevels;

  // Format package opened status
  const getPackageOpenedLabel = (value?: 'yes' | 'no' | 'Egal') => {
    if (!value) return 'Egal';
    switch(value) {
      case 'yes': return 'Ja';
      case 'no': return 'Nein';
      case 'Egal': return 'Egal';
      default: return 'Egal';
    }
  };

  // Format shipping type
  const getShippingTypeLabel = (value: string) => {
    switch(value) {
      case 'paket': return 'Paket';
      case 'spedition': return 'Spedition';
      case 'Egal': return 'Egal';
      default: return value;
    }
  };

  const getContextInfoParts = (rule: DiscountRule) => {
    const parts = [];
    
    if (rule.triggers.length > 0) {
      parts.push(
        <Box key="trigger">
          <Text style={{ fontSize: 18 }} c="dimmed">Gründe</Text>
          <Text style={{ fontSize: 20 }}>{getTriggerLabels(rule.triggers)}</Text>
        </Box>
      );
    }
    
    const packageOpenedLabel = getPackageOpenedLabel(rule.packageOpened);
    if (packageOpenedLabel) {
      parts.push(
        <Box key="packageOpened">
          <Text style={{ fontSize: 18 }} c="dimmed">Originalverpackt?</Text>
          <Text style={{ fontSize: 20 }}>{packageOpenedLabel}</Text>
        </Box>
      );
    }
    
    const shippingTypeLabel = getShippingTypeLabel(rule.shippingType);
    if (shippingTypeLabel) {
      parts.push(
        <Box key="shippingType">
          <Text style={{ fontSize: 18 }} c="dimmed">Versandart</Text>
          <Text style={{ fontSize: 20 }}>{shippingTypeLabel}</Text>
        </Box>
      );
    }

    return <Stack gap="xs">{parts}</Stack>;
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
    <Stack gap={20}>
      <Group justify="space-between" align="center">
        <Group>
          <ActionIcon variant="subtle" onClick={onBack}>
            <IconArrowLeft size={24} />
          </ActionIcon>
          <Text style={{ fontSize: 24 }}>{rule.name}</Text>
        </Group>
        <Button onClick={() => onEdit(rule)} leftSection={<IconEdit size={20} />} color="blue" style={{ fontSize: 20, fontWeight: 400 }} h={50}>
          Bearbeiten
        </Button>
      </Group>

      <Paper p="md" withBorder>
        <Stack gap={20}>
          <Box>
            {getContextInfoParts(rule)}
          </Box>

          {!rule.hasMultipleStages && (
            <>
              <Divider />
              <Box mt={0}>
                <Text style={{ fontSize: 18 }} c="dimmed">Berechnungsgrundlage</Text>
                <Text style={{ fontSize: 20 }}>{getCalculationBaseLabel(rule.calculationBase)}</Text>
              </Box>

              {shouldShowValue && (
                <Box mt={0}>
                  <Text style={{ fontSize: 18 }} c="dimmed">Wert</Text>
                  <Text style={{ fontSize: 20 }}>
                    {rule.calculationBase === 'prozent_vom_vk' ? `${rule.value}%` : `${rule.value}€`}
                  </Text>
                </Box>
              )}

              {showPriceThresholds && (
                <>
                  <Divider />
                  <Box mt={0}>
                    <Text style={{ fontSize: 18 }} c="dimmed" mb="xs">Preisstaffelung</Text>
                    <Stack gap={8}>
                      {rule.priceThresholds.map((threshold, index) => (
                        <Group key={index} gap="xs" wrap="nowrap">
                          <Text style={{ fontSize: 20 }}>
                            {threshold.minPrice}€ 
                            {threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : ' und höher'}:
                          </Text>
                          <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                            {threshold.valueType === 'percent' ? `${threshold.value}%` : `${threshold.value}€`}
                            ({getRoundingRuleLabel(threshold.roundingRule)})
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}

              {showDiscountLevels && (
                <>
                  <Divider />
                  <Box mt={0}>
                    <Text style={{ fontSize: 18 }} c="dimmed" mb="xs">Nachlassstaffelung</Text>
                    <Group gap={8}>
                      {rule.discountLevels.map((level, index, array) => (
                        <React.Fragment key={index}>
                          <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                            {level.valueType === 'percent' ? `${level.value}%` : `${level.value}€`}
                            ({getRoundingRuleLabel(level.roundingRule)})
                          </Badge>
                          {index < array.length - 1 && <Text>→</Text>}
                        </React.Fragment>
                      ))}
                    </Group>
                  </Box>
                </>
              )}

              {shouldShowGeneralRounding && (
                <Box mt={0}>
                  <Text style={{ fontSize: 18 }} c="dimmed">Rundungsregel</Text>
                  <Text style={{ fontSize: 20 }}>{getRoundingRuleLabel(rule.roundingRule)}</Text>
                </Box>
              )}

              {(rule.calculationBase === 'prozent_vom_vk' || rule.calculationBase === 'preisstaffel') && rule.maxAmount && (
                <Box mt={0}>
                  <Text style={{ fontSize: 18 }} c="dimmed">Maximalbetrag</Text>
                  <Text style={{ fontSize: 20 }}>{rule.maxAmount}€</Text>
                </Box>
              )}
            </>
          )}

          {rule.hasMultipleStages && rule.calculationStages && rule.calculationStages.length > 0 && (
            <>
              <Divider />
              <Box mt={0}>
                <Text style={{ fontSize: 18 }} c="dimmed" mb="xs">Angebotsstufen</Text>
                <Stack gap={16}>
                  {rule.calculationStages.map((stage, index) => (
                    <Paper key={index} p="md" withBorder>
                      <Stack gap={12}>
                        <Text style={{ fontSize: 20 }}>Stufe {index + 1}</Text>
                        <Group grow>
                          <Box>
                            <Text style={{ fontSize: 18 }} c="dimmed">Berechnungsgrundlage</Text>
                            <Text style={{ fontSize: 20 }}>{getCalculationBaseLabel(stage.calculationBase)}</Text>
                          </Box>
                          {stage.calculationBase !== 'preisstaffel' && stage.roundingRule !== "keine_rundung" && (
                            <Box>
                              <Text style={{ fontSize: 18 }} c="dimmed">Rundungsregel</Text>
                              <Text style={{ fontSize: 20 }}>{getRoundingRuleLabel(stage.roundingRule)}</Text>
                            </Box>
                          )}
                        </Group>

                        {stage.calculationBase === 'prozent_vom_vk' || stage.calculationBase === 'fester_betrag' ? (
                          <Box>
                            <Text style={{ fontSize: 18 }} c="dimmed">Wert</Text>
                            <Text style={{ fontSize: 20 }}>
                              {stage.calculationBase === 'prozent_vom_vk' ? `${stage.value}%` : `${stage.value}€`}
                            </Text>
                          </Box>
                        ) : null}

                        {stage.calculationBase === 'preisstaffel' && stage.priceThresholds && stage.priceThresholds.length > 0 && (
                          <Box>
                            <Text style={{ fontSize: 18 }} c="dimmed" mb="xs">Preisstaffelung</Text>
                            <Stack gap={8}>
                              {stage.priceThresholds.map((threshold, thresholdIndex) => (
                                <Group key={thresholdIndex} gap="xs" wrap="nowrap">
                                  <Text style={{ fontSize: 20 }}>
                                    {threshold.minPrice}€ 
                                    {threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : ' und höher'}:
                                  </Text>
                                  <Badge style={{ fontSize: 18, height: 30, fontWeight: 400 }} styles={{ root: { textTransform: 'none', color: 'white', backgroundColor: '#0563C1' } }}>
                                    {threshold.valueType === 'percent' ? `${threshold.value}%` : `${threshold.value}€`}
                                    ({getRoundingRuleLabel(threshold.roundingRule)})
                                  </Badge>
                                </Group>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
                {rule.maxAmount && (
                  <Box mt={20}>
                    <Text style={{ fontSize: 18 }} c="dimmed">Maximalbetrag</Text>
                    <Text style={{ fontSize: 20 }}>{rule.maxAmount}€</Text>
                  </Box>
                )}
              </Box>
            </>
          )}

          {rule.consultPartnerBeforePayout && (
            <Stack gap={20}>
              <Divider />
              <Box>
                <Text style={{ fontSize: 18 }} c="dimmed">Zusatzaktionen</Text>
                <Text style={{fontSize: 20}}>Rücksprache mit Partner vor Auszahlung</Text>
              </Box>
            </Stack>
          )}
          {rule.notes && (
            <Stack gap={20}>
              <Divider />
              <Box>
                <Text style={{ fontSize: 18 }} c="dimmed">Notizen</Text>
                <Text style={{ fontSize: 20 }}>{rule.notes}</Text>
              </Box>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default RuleDetail;