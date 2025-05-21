import React, { useState } from "react";
import { DiscountRule, Trigger } from "../models/ruleTypes";
import { 
  getCalculationBaseLabel, 
  getRoundingRuleLabel,
  getThresholdValueTypeLabel,
  getReturnStrategyLabel,
  getTriggerLabel
} from "../utils/discountUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconSearch, IconFilter, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { Input } from "@/components/ui/input";
import { Button } from '@mantine/core';
import { Separator } from "@/components/ui/separator";

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
        return <Badge>{rule.value}%{rule.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(rule.roundingRule)}`}</Badge>;
      case 'fester_betrag':
        return <Badge>{rule.value}€ Festbetrag{rule.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(rule.roundingRule)}`}</Badge>;
      case 'preisstaffel':
        if (!rule.priceThresholds || rule.priceThresholds.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1 mt-1">
            {rule.priceThresholds.map((threshold, idx) => (
              <Badge key={idx} className="text-xs">
                {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
                {threshold.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(threshold.roundingRule)}`}
                {threshold.consultPartnerBeforePayout && (
                  <span className="ml-1 text-amber-600">(Merchant kontaktieren)</span>
                )}
              </Badge>
            ))}
          </div>
        );
      case 'angebotsstaffel':
        if (!rule.discountLevels || rule.discountLevels.length === 0) return null;
        return (
          <div className="flex items-center flex-wrap gap-1 mt-1">
            {rule.discountLevels.map((level, idx, arr) => (
              <React.Fragment key={idx}>
                <Badge className="text-xs">
                  {level.value}{getThresholdValueTypeLabel(level.valueType)}
                  {level.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(level.roundingRule)}`}
                </Badge>
                {idx < arr.length - 1 && <span className="text-xs">→</span>}
              </React.Fragment>
            ))}
          </div>
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
        <span key="trigger">
          <strong>Gründe:</strong>{' '}
          <span>{getTriggerLabels(rule.triggers)}</span>
        </span>
      );
    }
    
    const packageOpenedLabel = getPackageOpenedLabel(rule.packageOpened);
    if (packageOpenedLabel) {
      parts.push(
        <span key="packageOpened">
          <strong>Originalverpackt?:</strong>{' '}
          <span>{packageOpenedLabel}</span>
        </span>
      );
    }
    
    const shippingTypeLabel = getShippingTypeLabel(rule.shippingType);
    if (shippingTypeLabel) {
      parts.push(
        <span key="shippingType">
          <strong>Versandart:</strong>{' '}
          <span>{shippingTypeLabel}</span>
        </span>
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Regeln suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
      </div>
      
      <div className="space-y-2">
        {filteredRules.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Keine Regeln gefunden. Erstellen Sie eine neue Regel.
            </CardContent>
          </Card>
        ) : (
          filteredRules.map(rule => (
            <Card 
              key={rule.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onSelectRule(rule)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{rule.name}</h3>
                    
                    {/* Context information line with dynamic separator dots */}
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {getContextInfoParts(rule).map((part, index, array) => (
                        <React.Fragment key={`fragment-${index}`}>
                          {part}
                          {index < array.length - 1 && <span className="mx-1">•</span>}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Calculation information */}
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-2">
                        <strong>Berechnung:</strong>{' '}
                        {rule.hasMultipleStages ? (
                          <span>Mehrere Angebotsstufen</span>
                        ) : (
                          <>
                            <span>{getCalculationBaseLabel(rule.calculationBase)}</span>
                        </>
                      )}
                      </div>
                      {rule.hasMultipleStages && (
                        <div className="flex flex-wrap gap-4">
                          {rule.calculationStages?.map((stage, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <strong>Stufe {idx + 1}:</strong>
                              <div>
                                {stage.calculationBase === 'prozent_vom_vk' && (
                                  <Badge>{stage.value}%{stage.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(stage.roundingRule)}`}</Badge>
                      )}
                                {stage.calculationBase === 'fester_betrag' && (
                                  <Badge>{stage.value}€ Festbetrag{stage.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(stage.roundingRule)}`}</Badge>
                      )}
                                {stage.calculationBase === 'preisstaffel' && stage.priceThresholds && (
                                  <div className="flex flex-wrap gap-1">
                                    {stage.priceThresholds.map((threshold, tIdx) => (
                                      <Badge key={tIdx} className="text-xs">
                                        {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                                        {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
                                        {threshold.roundingRule !== 'keine_rundung' && `, ${getRoundingRuleLabel(threshold.roundingRule)}`}
                                        {threshold.consultPartnerBeforePayout && (
                                          <span className="ml-1 text-amber-600">(Merchant kontaktieren)</span>
                                        )}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Discount details */}
                    {!rule.hasMultipleStages && (
                      <div className="mt-2">
                        {renderDiscountInfo(rule)}
                      </div>
                    )}

                    {/* Max amount if exists */}
                    {rule.maxAmount && (
                      <div className="mt-1">
                        <Badge className="text-xs">Max: {rule.maxAmount}€</Badge>
                      </div>
                    )}
                    
                    {/* Special rules and notes */}
                    <div className="mt-2 text-xs">
                      {/* Special rules display */}
                      {(rule.requestPictures || 
                        rule.previousRefundsCheck || 
                        rule.customerLoyaltyCheck || 
                        rule.minOrderAgeToDays || 
                        rule.consultPartnerBeforePayout ||
                        rule.noReturnOnFullRefund ||
                        rule.offerDiscountBeforeReturn ||
                        rule.sendInfoToPartner) && (
                        <div className="text-muted-foreground">
                          <strong>Zusatzaktionen:</strong>{' '}
                          {rule.requestPictures && <span>Fotos anfordern</span>}
                          {rule.previousRefundsCheck && <span>{(rule.requestPictures || rule.previousRefundsCheck) ? ' • ' : ''}Vorherige Erstattungen prüfen</span>}
                          {rule.customerLoyaltyCheck && <span>{(rule.requestPictures || rule.previousRefundsCheck) ? ' • ' : ''}Kundentreue prüfen</span>}
                          {rule.minOrderAgeToDays && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck) ? ' • ' : ''}Min. Bestellalter: {rule.minOrderAgeToDays} Tage</span>}
                          {rule.consultPartnerBeforePayout && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays) ? ' • ' : ''}Rücksprache mit Partner vor Auszahlung</span>}
                          {rule.noReturnOnFullRefund && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays || rule.consultPartnerBeforePayout) ? ' • ' : ''}Keine Rücksendung bei voller Erstattung</span>}
                          {rule.offerDiscountBeforeReturn && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays || rule.consultPartnerBeforePayout || rule.noReturnOnFullRefund) ? ' • ' : ''}Nachlass vor Rücksendung anbieten</span>}
                          {rule.sendInfoToPartner && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays || rule.consultPartnerBeforePayout || rule.noReturnOnFullRefund || rule.offerDiscountBeforeReturn) ? ' • ' : ''}Partner informieren</span>}
                        </div>
                      )}
                      
                      {/* Notes display */}
                      {rule.notes && (
                        <div className="text-muted-foreground mt-1">
                          <strong>Notizen:</strong> {rule.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRule(rule);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRule(rule.id);
                      }}
                      className="text-blue-500 hover:text-red-700"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RuleList;
