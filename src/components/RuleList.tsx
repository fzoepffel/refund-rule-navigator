
import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { 
  getCalculationBaseLabel, 
  getRoundingRuleLabel,
  getThresholdValueTypeLabel,
  getReturnStrategyLabel,
  getTriggerLabel
} from "../utils/discountUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    return packageOpened === 'yes' ? 'Paket geöffnet' : 'Paket ungeöffnet';
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
        return <Badge variant="outline">{rule.value}% vom Verkaufspreis</Badge>;
      case 'fester_betrag':
        return <Badge variant="outline">{rule.value}€ Festbetrag</Badge>;
      case 'preisstaffel':
        if (!rule.priceThresholds || rule.priceThresholds.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1 mt-1">
            {rule.priceThresholds.map((threshold, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {threshold.minPrice}€{threshold.maxPrice ? ` bis ${threshold.maxPrice}€` : '+'}: 
                {threshold.value}{getThresholdValueTypeLabel(threshold.valueType)}
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
                <Badge variant="outline" className="text-xs">
                  {level.value}{getThresholdValueTypeLabel(level.valueType)}
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Regeln suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
        <Button className="flex items-center gap-2" onClick={onCreateRule}>
          <Plus className="h-4 w-4" /> Neue Regel
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
                    <h3 className="font-medium">{rule.name}</h3>
                    
                    {/* Context information line in gray */}
                    <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                      
                      {rule.requestType !== 'Egal' && (
                        <>
                          <span>•</span>
                          <strong>Art der Anfrage:</strong>{' '}
                          <span>{rule.requestType}</span>
                        </>
                      )}

                      {rule.triggers[0] !== 'Egal' && (
                        <>
                          {rule.returnStrategy && <span>•</span>}
                          <strong>Grund:</strong>{' '}
                          <span>{getTriggerLabel(rule.triggers[0])}</span>
                        </>
                      )}

                      {rule.requestType !== 'Egal' && (
                        <>
                          <span>•</span>
                          <strong>Gewünschte Vorgehensweise:</strong>{' '}
                          <span>{rule.requestType}</span>
                        </>
                      )}
                      
                      {getPackageOpenedLabel(rule.packageOpened) && (
                        <>
                          <span>•</span>
                          <strong>Produkt geöffnet:</strong>{' '}
                          <span>{getPackageOpenedLabel(rule.packageOpened)}</span>
                        </>
                      )}
                      
                      {rule.shippingType !== 'Egal' && (
                        <>
                          <span>•</span>
                          <strong>Versandart:</strong>{' '}
                          <span>{getShippingTypeLabel(rule.shippingType)}</span>
                        </>
                      )}
                    </div>

                    {/* Return strategy display (now before calculation info) */}
                    {rule.returnStrategy && (
                      <div className="text-muted-foreground mt-2 text-sm">
                        <strong>Rückgabestrategie:</strong>{' '}
                        {getReturnStrategyLabel(rule.returnStrategy)}
                      </div>
                    )}

                    {/* Calculation information */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <strong>Berechnung:</strong>{' '}
                      <span>{getCalculationBaseLabel(rule.calculationBase)}</span>
                      <span>•</span>
                      <span>{getRoundingRuleLabel(rule.roundingRule)}</span>
                    </div>

                    {/* Discount details */}
                    <div className="mt-2">
                      {renderDiscountInfo(rule)}
                    </div>

                    {/* Max amount if exists */}
                    {rule.maxAmount && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">Max: {rule.maxAmount}€</Badge>
                      </div>
                    )}
                    
                    {/* Special rules and notes */}
                    <div className="mt-2 text-sm">
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
                          <strong>Sonderregeln:</strong>{' '}
                          {rule.requestPictures && <span>Fotos anfordern</span>}
                          {rule.previousRefundsCheck && <span>{rule.requestPictures ? ' • ' : ''}Vorherige Erstattungen prüfen</span>}
                          {rule.customerLoyaltyCheck && <span>{(rule.requestPictures || rule.previousRefundsCheck) ? ' • ' : ''}Kundentreue prüfen</span>}
                          {rule.minOrderAgeToDays && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck) ? ' • ' : ''}Min. Bestellalter: {rule.minOrderAgeToDays} Tage</span>}
                          {rule.consultPartnerBeforePayout && <span>{(rule.requestPictures || rule.previousRefundsCheck || rule.customerLoyaltyCheck || rule.minOrderAgeToDays) ? ' • ' : ''}Partner vor Auszahlung konsultieren</span>}
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRule(rule.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
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
