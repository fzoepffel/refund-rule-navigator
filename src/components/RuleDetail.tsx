import React from "react";
import { DiscountRule, Trigger } from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getReturnHandlingLabel,
  getThresholdValueTypeLabel,
  getTriggerLabels
} from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
          <strong>Produkt geöffnet?:</strong>{' '}
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
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold flex-1">{rule.name}</h2>
        <Button onClick={() => onEdit(rule)} className="flex items-center gap-2">
          <Edit className="h-4 w-4" /> Bearbeiten
        </Button>
      </div>

      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Gründe</div>
              <div className="font-medium">
                {getTriggerLabels(rule.triggers)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Paket geöffnet</div>
              <div className="font-medium">
                {getPackageOpenedLabel(rule.packageOpened)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Versandart</div>
              <div className="font-medium">{getShippingTypeLabel(rule.shippingType)}</div>
            </div>
          </div>

          <Separator />

          {!rule.hasMultipleStages && (
            <>
              <div>
                <div className="text-sm text-muted-foreground">Berechnungsgrundlage</div>
                <div className="font-medium">{getCalculationBaseLabel(rule.calculationBase)}</div>
              </div>

              {shouldShowValue && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Wert</div>
                    <div className="font-medium">
                      {rule.calculationBase === 'prozent_vom_vk' ? `${rule.value}%` : `${rule.value}€`}
                    </div>
                  </div>
                </>
              )}

              {showPriceThresholds && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Preisstaffelung</div>
                    <div className="space-y-2">
                      {rule.priceThresholds.map((threshold, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div>
                            {threshold.minPrice}€ 
                            {threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : ' und höher'}:
                          </div>
                          <div className="font-medium">
                            {threshold.valueType === 'percent' ? `${threshold.value}%` : `${threshold.value}€`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            (Rundung: {getRoundingRuleLabel(threshold.roundingRule)})
                          </div>
                          {threshold.consultPartnerBeforePayout && (
                            <div className="text-sm text-amber-600">
                              (Merchant kontaktieren)
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {showDiscountLevels && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Nachlassstaffelung</div>
                    <div className="flex items-center gap-2">
                      {rule.discountLevels.map((level, index, array) => (
                        <React.Fragment key={index}>
                          <Badge>
                            {level.valueType === 'percent' ? `${level.value}%` : `${level.value}€`}
                            <span className="ml-1 text-xs opacity-70">
                              ({getRoundingRuleLabel(level.roundingRule)})
                            </span>
                          </Badge>
                          {index < array.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {shouldShowGeneralRounding && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Rundungsregel</div>
                    <div className="font-medium">{getRoundingRuleLabel(rule.roundingRule)}</div>
                  </div>
                </>
              )}
            </>
          )}

          {rule.hasMultipleStages && rule.calculationStages && rule.calculationStages.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Angebotsstufen</div>
                <div className="space-y-4">
                  {rule.calculationStages.map((stage, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="font-medium">Stufe {index + 1}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Berechnungsgrundlage</div>
                          <div className="font-medium">{getCalculationBaseLabel(stage.calculationBase)}</div>
                        </div>
                        {stage.calculationBase !== 'preisstaffel' && stage.roundingRule !== "keine_rundung" && (
                          <div>
                            <div className="text-sm text-muted-foreground">Rundungsregel</div>
                            <div className="font-medium">{getRoundingRuleLabel(stage.roundingRule)}</div>
                          </div>
                        )}
                      </div>

                      {stage.calculationBase === 'prozent_vom_vk' || stage.calculationBase === 'fester_betrag' ? (
                        <div>
                          <div className="text-sm text-muted-foreground">Wert</div>
                          <div className="font-medium">
                            {stage.calculationBase === 'prozent_vom_vk' ? `${stage.value}%` : `${stage.value}€`}
                          </div>
                        </div>
                      ) : null}

                      {stage.calculationBase === 'preisstaffel' && stage.priceThresholds && stage.priceThresholds.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Preisstaffelung</div>
                          <div className="space-y-2">
                            {stage.priceThresholds.map((threshold, thresholdIndex) => (
                              <div key={thresholdIndex} className="flex items-center gap-2">
                                <div>
                                  {threshold.minPrice}€ 
                                  {threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : ' und höher'}:
                                </div>
                                <div className="font-medium">
                                  {threshold.valueType === 'percent' ? `${threshold.value}%` : `${threshold.value}€`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  (Rundung: {getRoundingRuleLabel(threshold.roundingRule)})
                                </div>
                                {threshold.consultPartnerBeforePayout && (
                                  <div className="text-sm text-amber-600">
                                    (Merchant kontaktieren)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {rule.maxAmount && (
            <>
              <div>
                <div className="text-sm text-muted-foreground">Maximalbetrag</div>
                <div className="font-medium">{rule.maxAmount}€</div>
              </div>
            </>
          )}

          {(rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays || rule.requestPictures || rule.offerDiscountBeforeReturn || rule.consultPartnerBeforePayout || rule.sendInfoToPartner) && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Zusatzaktionen</div>
                <div className="space-y-2">
                  {rule.consultPartnerBeforePayout && (
                    <div className="font-medium">Rücksprache mit Partner vor Auszahlung</div>
                  )}
                </div>
              </div>
            </>
          )}

          {rule.notes && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Notizen</div>
                <div className="font-medium whitespace-pre-wrap">{rule.notes}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RuleDetail;
