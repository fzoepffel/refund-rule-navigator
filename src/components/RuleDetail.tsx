import React from "react";
import { DiscountRule } from "../models/ruleTypes";
import { 
  getTriggerLabel, 
  getCalculationBaseLabel, 
  getRoundingRuleLabel, 
  getCostCenterLabel, 
  getReturnHandlingLabel 
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Kostenträger</div>
              <div className="font-medium">{getCostCenterLabel(rule.costCenter)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Retourenabwicklung</div>
              <div className="font-medium">{getReturnHandlingLabel(rule.returnHandling)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Versandart</div>
              <div className="font-medium">{rule.shippingType === 'paket' ? 'Paket' : 'Spedition'}</div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-2">Anlässe</div>
            <div className="flex flex-wrap gap-2">
              {rule.triggers.map(trigger => (
                <Badge key={trigger} variant="outline">{getTriggerLabel(trigger)}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground">Berechnungsgrundlage</div>
            <div className="font-medium">{getCalculationBaseLabel(rule.calculationBase)}</div>
          </div>

          {rule.value !== undefined && (
            <>
              <div>
                <div className="text-sm text-muted-foreground">Wert</div>
                <div className="font-medium">
                  {rule.calculationBase === 'prozent_vom_vk' ? `${rule.value}%` : `${rule.value}€`}
                </div>
              </div>
            </>
          )}

          {rule.priceThresholds && rule.priceThresholds.length > 0 && (
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
                        {rule.calculationBase === 'prozent_vom_vk' ? `${threshold.value}%` : `${threshold.value}€`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {rule.discountLevels && rule.discountLevels.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Nachlassstaffelung</div>
                <div className="flex items-center gap-2">
                  {rule.discountLevels.map((level, index, array) => (
                    <React.Fragment key={index}>
                      <Badge>{level}%</Badge>
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

          {(rule.checkIfProductOpened || rule.offerDiscountBeforeReturn || rule.requestPictures || rule.consultPartnerBeforePayout || rule.sendInfoToPartner) && (
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
                  {rule.offerDiscountBeforeReturn && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Erst Nachlass anbieten, dann Retoure</Badge>
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
                  {rule.sendInfoToPartner && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Info über Gründe an Partner senden</Badge>
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
