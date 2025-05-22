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
          <Text size="sm" c="dimmed">Gründe</Text>
          <Text fw={500}>{getTriggerLabels(rule.triggers)}</Text>
        </Box>
      );
    }
    
    const packageOpenedLabel = getPackageOpenedLabel(rule.packageOpened);
    if (packageOpenedLabel) {
      parts.push(
        <Box key="packageOpened">
          <Text size="sm" c="dimmed">Originalverpackt?</Text>
          <Text fw={500}>{packageOpenedLabel}</Text>
        </Box>
      );
    }
    
    const shippingTypeLabel = getShippingTypeLabel(rule.shippingType);
    if (shippingTypeLabel) {
      parts.push(
        <Box key="shippingType">
          <Text size="sm" c="dimmed">Versandart</Text>
          <Text fw={500}>{shippingTypeLabel}</Text>
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
    <Stack gap="md">
      <Group>
        <ActionIcon variant="outline" onClick={onBack}>
          <IconArrowLeft size={16} />
        </ActionIcon>
        <Title order={2} style={{ flex: 1 }}>{rule.name}</Title>
        <Button onClick={() => onEdit(rule)} leftSection={<IconEdit size={16} />}>
          Bearbeiten
        </Button>
      </Group>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Box>
            {getContextInfoParts(rule)}
          </Box>

          

          {!rule.hasMultipleStages && (
            <>
            <Divider />
              <Box>
                <Text size="sm" c="dimmed">Berechnungsgrundlage</Text>
                <Text fw={500}>{getCalculationBaseLabel(rule.calculationBase)}</Text>
              </Box>

              {shouldShowValue && (
                <Box>
                  <Text size="sm" c="dimmed">Wert</Text>
                  <Text fw={500}>
                    {rule.calculationBase === 'prozent_vom_vk' ? `${rule.value}%` : `${rule.value}€`}
                  </Text>
                </Box>
              )}

              {showPriceThresholds && (
                <>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">Preisstaffelung</Text>
                    <Stack gap="xs">
                      {rule.priceThresholds.map((threshold, index) => (
                        <Group key={index} gap="xs" wrap="nowrap">
                          <Text>
                            {threshold.minPrice}€ 
                            {threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : ' und höher'}:
                          </Text>
                          <Badge styles={{ root: { textTransform: 'none' } }}>
                            {threshold.valueType === 'percent' ? `${threshold.value}%` : `${threshold.value}€`}
                            
                              ({getRoundingRuleLabel(threshold.roundingRule)})
                            
                            {threshold.consultPartnerBeforePayout && (
                              <Text span size="xs" c="yellow.6" ml={5}>
                                (Merchant kontaktieren)
                              </Text>
                            )}
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
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">Nachlassstaffelung</Text>
                    <Group gap="xs">
                      {rule.discountLevels.map((level, index, array) => (
                        <React.Fragment key={index}>
                          <Badge styles={{ root: { textTransform: 'none' } }}>
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
                <Box>
                  <Text size="sm" c="dimmed">Rundungsregel</Text>
                  <Text fw={500}>{getRoundingRuleLabel(rule.roundingRule)}</Text>
                </Box>
              )}
            </>
          )}

          {rule.hasMultipleStages && rule.calculationStages && rule.calculationStages.length > 0 && (
            <>
              <Divider />
              <Box>
                <Text size="sm" c="dimmed" mb="xs">Angebotsstufen</Text>
                <Stack gap="md">
                  {rule.calculationStages.map((stage, index) => (
                    <Paper key={index} p="md" withBorder>
                      <Stack gap="xs">
                        <Text fw={500}>Stufe {index + 1}</Text>
                        <Group grow>
                          <Box>
                            <Text size="sm" c="dimmed">Berechnungsgrundlage</Text>
                            <Text fw={500}>{getCalculationBaseLabel(stage.calculationBase)}</Text>
                          </Box>
                          {stage.calculationBase !== 'preisstaffel' && stage.roundingRule !== "keine_rundung" && (
                            <Box>
                              <Text size="sm" c="dimmed">Rundungsregel</Text>
                              <Text fw={500}>{getRoundingRuleLabel(stage.roundingRule)}</Text>
                            </Box>
                          )}
                        </Group>

                        {stage.calculationBase === 'prozent_vom_vk' || stage.calculationBase === 'fester_betrag' ? (
                          <Box>
                            <Text size="sm" c="dimmed">Wert</Text>
                            <Text fw={500}>
                              {stage.calculationBase === 'prozent_vom_vk' ? `${stage.value}%` : `${stage.value}€`}
                            </Text>
                          </Box>
                        ) : null}

                        {stage.calculationBase === 'preisstaffel' && stage.priceThresholds && stage.priceThresholds.length > 0 && (
                          <Box>
                            <Text size="sm" c="dimmed" mb="xs">Preisstaffelung</Text>
                            <Stack gap="xs">
                              {stage.priceThresholds.map((threshold, thresholdIndex) => (
                                <Group key={thresholdIndex} gap="xs" wrap="nowrap">
                                  <Text>
                                    {threshold.minPrice}€ 
                                    {threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : ' und höher'}:
                                  </Text>
                                  <Badge styles={{ root: { textTransform: 'none' } }}>
                                    {threshold.valueType === 'percent' ? `${threshold.value}%` : `${threshold.value}€`}
                                    
                                      ({getRoundingRuleLabel(threshold.roundingRule)})
                                   
                                    {threshold.consultPartnerBeforePayout && (
                                      <Text span size="xs" c="yellow.6" ml={5}>
                                        (Merchant kontaktieren)
                                      </Text>
                                    )}
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
              </Box>
            </>
          )}

          {rule.maxAmount && (
            <Box>
              <Text size="sm" c="dimmed">Maximalbetrag</Text>
              <Text fw={500}>{rule.maxAmount}€</Text>
            </Box>
          )}

          {(rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays || rule.requestPictures || rule.offerDiscountBeforeReturn || rule.consultPartnerBeforePayout || rule.sendInfoToPartner) && (
            <>
              <Divider />
              <Box>
                <Text size="sm" c="dimmed" mb="xs">Zusatzaktionen</Text>
                <Stack gap="xs">
                  {rule.consultPartnerBeforePayout && (
                    <Text fw={500}>Rücksprache mit Partner vor Auszahlung</Text>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {rule.notes && (
            <>
              <Divider />
              <Box>
                <Text size="sm" c="dimmed">Notizen</Text>
                <Text fw={500} style={{ whiteSpace: 'pre-wrap' }}>{rule.notes}</Text>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default RuleDetail;
