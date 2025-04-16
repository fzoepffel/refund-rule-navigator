import React from "react";
import { DiscountRule } from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getReturnStrategyLabel 
} from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
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
          <CardTitle>Grundinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Rückgabestrategie</div>
              <div className="font-medium">
                {rule.returnStrategy 
                  ? getReturnStrategyLabel(rule.returnStrategy) 
                  : 'Keine Strategie definiert'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Versandart</div>
              <div className="font-medium">{rule.shippingType === 'paket' ? 'Paket' : 'Spedition'}</div>
            </div>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Art der Anfrage</div>
              <div className="font-medium">{rule.requestType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Gründe</div>
              <div className="flex flex-wrap gap-2">
                {rule.triggers.map(trigger => (
                  <Badge key={trigger} variant="outline">{getTriggerLabel(trigger)}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

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
                      </Badge>
                      {index < array.length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground">Rundungsregel</div>
            <div className="font-medium">{getRoundingRuleLabel(rule.roundingRule)}</div>
          </div>

          {rule.maxAmount && (
            <>
              <div>
                <div className="text-sm text-muted-foreground">Maximalbetrag</div>
                <div className="font-medium">{rule.maxAmount}€</div>
              </div>
            </>
          )}

          {(rule.checkIfProductOpened || rule.requestPictures || rule.consultPartnerBeforePayout) && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Zusatzaktionen</div>
                <div className="space-y-2">
                  {rule.checkIfProductOpened && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Prüfung ob Produkt geöffnet</Badge>
                    </div>
                  )}
                  {rule.requestPictures && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Bilder anfordern</Badge>
                    </div>
                  )}
                  {rule.consultPartnerBeforePayout && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Rücksprache mit Partner vor Auszahlung</Badge>
                    </div>
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
