import React, { useState } from "react";
import { DiscountRule } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@mantine/core';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { IconCalculator, IconActivity, IconX, IconPlayerSkipForward } from '@tabler/icons-react';
import { useToast } from "@/hooks/use-toast";

interface RuleCalculatorProps {
  rule: DiscountRule;
}

const RuleCalculator: React.FC<RuleCalculatorProps> = ({ rule }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [discountAmount, setDiscountAmount] = useState<number | string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [offeringReturn, setOfferingReturn] = useState<boolean>(false);
  const [showInitialMessage, setShowInitialMessage] = useState<boolean>(false);
  const [showRefund, setShowRefund] = useState<boolean>(false);
  const [showFinalResult, setShowFinalResult] = useState<boolean>(false);
  const [isFirstRejection, setIsFirstRejection] = useState<boolean>(true);
  const { toast } = useToast();
  
  const getInitialMessage = () => {
    if (currentStage === 0) {
      return "Es tut uns leid für die Unannehmlichkeiten mit Ihrem Produkt.\nWir senden eine Nachricht an unseren Partner, um nach einem angemessenen Preisnachlass zu fragen. Bitte haben Sie einen Moment Geduld.";
    } else {
      return "Wir setzen uns erneut für Sie ein!\nWir sprechen noch einmal mit unserem Partner und versuchen alles Mögliche, um einen höheren Preisnachlass für Sie zu erreichen. Bitte haben Sie einen Moment Geduld.";
    }
  };

  const calculateRefund = (price: number, stage: typeof rule.calculationStages[0]) => {
    if (!stage) return 0;

    let refund = 0;
      
    switch (stage.calculationBase) {
      case 'prozent_vom_vk':
        refund = (price * (stage.value || 0)) / 100;
        // Apply stage rounding rule
        if (stage.roundingRule) {
          refund = applyRoundingRule(refund, stage.roundingRule);
        }
        break;
      case 'fester_betrag':
        refund = stage.value || 0;
        // Apply stage rounding rule
        if (stage.roundingRule) {
          refund = applyRoundingRule(refund, stage.roundingRule);
        }
        break;
      case 'preisstaffel':
        const threshold = stage.priceThresholds?.find(t => 
          price >= t.minPrice && (!t.maxPrice || price <= t.maxPrice)
        );
        if (!threshold) return 0;
        refund = threshold.valueType === 'percent' 
          ? (price * threshold.value) / 100 
          : threshold.value;
        // Apply threshold rounding rule
        if (threshold.roundingRule) {
          refund = applyRoundingRule(refund, threshold.roundingRule);
        }
        break;
      default:
        return 0;
    }

    return refund;
  };

  const getCurrentRefund = () => {
    if (!rule.hasMultipleStages) {
      // For single stage, use the main rule properties
      let refund = 0;
      
      switch (rule.calculationBase) {
        case 'prozent_vom_vk':
          refund = (salePrice * (rule.value || 0)) / 100;
          if (rule.roundingRule) {
            refund = applyRoundingRule(refund, rule.roundingRule);
          }
          break;
        case 'fester_betrag':
          refund = rule.value || 0;
          if (rule.roundingRule) {
            refund = applyRoundingRule(refund, rule.roundingRule);
          }
          break;
        case 'preisstaffel':
          const threshold = rule.priceThresholds?.find(t => 
            salePrice >= t.minPrice && (!t.maxPrice || salePrice <= t.maxPrice)
          );
          if (!threshold) return 0;
          refund = threshold.valueType === 'percent' 
            ? (salePrice * threshold.value) / 100 
            : threshold.value;
          if (threshold.roundingRule) {
            refund = applyRoundingRule(refund, threshold.roundingRule);
          }
          break;
        default:
          return 0;
      }

      // Apply max amount if specified
      if (rule.maxAmount && refund > rule.maxAmount) {
        return rule.maxAmount;
    }
    
      return refund;
    }

    // For multiple stages, use the current stage
    if (!rule.calculationStages || rule.calculationStages.length === 0) return 0;
    
    let refund = calculateRefund(salePrice, rule.calculationStages[currentStage]);
    
    // Apply max amount if specified for the current stage
    if (rule.calculationStages[currentStage].maxAmount && refund > rule.calculationStages[currentStage].maxAmount) {
      return rule.calculationStages[currentStage].maxAmount;
    }
    
    // Check if any previous stage had a lower max amount
    for (let i = 0; i < currentStage; i++) {
      const stage = rule.calculationStages[i];
      if (stage.maxAmount && refund > stage.maxAmount) {
        return stage.maxAmount;
      }
    }
    
    // Check if the rule itself has a maximum amount
    if (rule.maxAmount && refund > rule.maxAmount) {
      return rule.maxAmount;
    }
    
    return refund;
  };

  const applyRoundingRule = (amount: number, rule: string): number => {
    switch (rule) {
      case 'keine_rundung':
        return amount;
      case 'auf_5_euro':
        return Math.ceil(amount / 5) * 5;
      case 'auf_10_euro':
        return Math.ceil(amount / 10) * 10;
      case 'auf_1_euro':
        return Math.ceil(amount);
      default:
        return amount;
    }
  };
  
  const handleCalculate = () => {
    setCurrentStage(0);
    setShowInitialMessage(true);
    setShowRefund(false);
    setShowFinalResult(false);
    setIsFirstRejection(true);
      setRequestCount(prevCount => prevCount + 1);
  };

  const handleFastForward = () => {
    setShowInitialMessage(false);
    if (rule.hasMultipleStages) {
      setShowRefund(true);
    } else {
      if (isFirstRejection) {
        setShowRefund(true);
      } else {
        setShowFinalResult(true);
      }
    }
  };
  
  const handleReject = () => {
    if (rule.hasMultipleStages && rule.calculationStages && currentStage < rule.calculationStages.length - 1) {
      setCurrentStage(prev => prev + 1);
      setShowRefund(false);
      setShowInitialMessage(true);
        } else {
      // If this is the last stage or not multiple stages, go directly to final result
      setShowRefund(false);
      setShowFinalResult(true);
    }
  };

  const getFinalResult = () => {
    switch (rule.returnStrategy) {
      case 'discount_then_return':
        return {
          message: "Vielen Dank für Ihre Geduld!\nLeider kann unser Partner keinen weiteren Preisnachlass anbieten. Allerdings können wir Ihnen eine volle Rückerstattung anbieten, wenn Sie den Artikel zurücksenden.",
          refund: salePrice,
          note: "Retoure erforderlich\nDer Artikel muss zurückgesendet werden."
        };
      case 'discount_then_keep':
        return {
          message: "Vielen Dank für Ihre Geduld!\nWir haben bei dem Partner nachgefragt und können Ihnen einen Preisnachlass von 100,00 € gewähren.",
          refund: salePrice,
          note: "Keine Retoure erforderlich\nDer Artikel muss NICHT zurückgesendet werden."
        };
      case 'discount_then_contact_merchant':
        return {
          message: "Händlerkontakt erforderlich\nWir müssen dies mit dem Händler besprechen.",
          refund: 0,
          note: ""
        };
      case 'auto_return_full_refund':
        return {
          message: "Erstattungen sind in ihrem Fall leider nicht möglich. Sie haben aber die Möglichkeit ihr Paket zurückzusenden und können so eine volle Rückerstattung erlangen.",
          refund: 0,
          note: ""
        };
      default:
        return {
          message: "",
          refund: 0,
          note: ""
        };
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preisnachlass berechnen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rule.returnStrategy === 'auto_return_full_refund' ? (
          <Alert>
            <AlertTitle>Automatische Retoure</AlertTitle>
            <AlertDescription>
              Diese Regel erfordert eine automatische Retoure. Bitte verwenden Sie den Retourenprozess.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salePrice">Verkaufspreis</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                />
              </div>
              <Button 
                variant="filled" 
                leftSection={<IconCalculator size={16} />}
                onClick={handleCalculate}
              >
                Berechnen
              </Button>
            </div>

            {showInitialMessage && (
              <Alert>
                <AlertTitle>Nachricht an den Partner</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {getInitialMessage()}
                </AlertDescription>
                <div className="mt-4">
                  <Button 
                    variant="light" 
                    leftSection={<IconPlayerSkipForward size={16} />}
                    onClick={handleFastForward}
                  >
                    Vorspulen
                  </Button>
                </div>
              </Alert>
            )}

            {showRefund && (
              <Alert>
                <AlertTitle>Angebotener Preisnachlass</AlertTitle>
                <AlertDescription>
                  <div className="text-2xl font-bold mb-2">
                    {formatCurrency(getCurrentRefund())}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="light" 
                      color="red"
                      leftSection={<IconX size={16} />}
                      onClick={handleReject}
                    >
                      Ablehnen
                    </Button>
                    <Button 
                      variant="filled" 
                      color="green"
                      leftSection={<IconActivity size={16} />}
                      onClick={() => {
                        setShowRefund(false);
                        setShowFinalResult(true);
                      }}
                    >
                      Akzeptieren
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {showFinalResult && (
              <Alert>
                <AlertTitle>Endergebnis</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {getFinalResult().message}
                  {getFinalResult().refund > 0 && (
                    <div className="mt-2 text-2xl font-bold">
                      {formatCurrency(getFinalResult().refund)}
                    </div>
                  )}
                  {getFinalResult().note && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {getFinalResult().note}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCalculator;
