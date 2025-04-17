
import React, { useState } from "react";
import { DiscountRule, CalculationStage } from "../models/ruleTypes";
import { calculateDiscount, formatCurrency, calculateDiscountForStage, calculateMultiStageDiscounts } from "../utils/discountUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Calculator, Activity, XCircle, FastForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RuleCalculatorProps {
  rule: DiscountRule;
}

const RuleCalculator: React.FC<RuleCalculatorProps> = ({ rule }) => {
  const [salePrice, setSalePrice] = useState<number>(100);
  const [discountAmount, setDiscountAmount] = useState<number | string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [currentDiscountLevel, setCurrentDiscountLevel] = useState<number>(0);
  const [offeringReturn, setOfferingReturn] = useState<boolean>(false);
  const [showApologyMessage, setShowApologyMessage] = useState<boolean>(false);
  const [showDiscountAmount, setShowDiscountAmount] = useState<boolean>(false);
  const [showNegotiatingMessage, setShowNegotiatingMessage] = useState<boolean>(false);
  const [showMerchantContactMessage, setShowMerchantContactMessage] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Helper function to generate an apology message based on the rule's triggers
  const getApologyMessage = () => {
    if (rule.triggers && rule.triggers.length > 0) {
      const trigger = rule.triggers[0];
      
      switch (trigger) {
        case 'Artikel beschädigt/funktioniert nicht mehr':
          return "Es tut uns leid zu hören, dass Ihr Produkt beschädigt ist oder nicht mehr funktioniert.";
        case 'Versandverpackung und Artikel beschädigt':
          return "Es tut uns leid zu hören, dass sowohl die Verpackung als auch Ihr Artikel beschädigt sind.";
        case 'Teile oder Zubehör fehlen':
          return "Es tut uns leid zu hören, dass Teile oder Zubehör bei Ihrem Produkt fehlen.";
        case 'Falscher Artikel':
          return "Es tut uns leid zu hören, dass Sie einen falschen Artikel erhalten haben.";
        default:
          return "Es tut uns leid für die Unannehmlichkeiten mit Ihrem Produkt.";
      }
    }
    
    return "Es tut uns leid für die Unannehmlichkeiten mit Ihrem Produkt.";
  };
  
  const calculateAndPrepareDiscount = () => {
    // Reset states when calculating a new discount
    setCurrentDiscountLevel(0);
    setOfferingReturn(false);
    setShowMerchantContactMessage(false);
    
    // Handle the contact_merchant_immediately strategy immediately
    if (rule.returnStrategy === 'contact_merchant_immediately') {
      setShowMerchantContactMessage(true);
      setShowApologyMessage(false);
      setShowDiscountAmount(false);
      
      toast({
        title: "Händlerkontakt erforderlich",
        description: "Dieser Fall erfordert Rücksprache mit dem Händler.",
      });
      return;
    }
    
    // If the return strategy is auto_return_full_refund, immediately offer full refund and return
    if (rule.returnStrategy === 'auto_return_full_refund') {
      setDiscountAmount(salePrice);
      setOfferingReturn(true);
      
      toast({
        title: "Vollerstattung angeboten",
        description: "Der Kunde erhält eine volle Rückerstattung und muss den Artikel zurücksenden.",
      });
    } else {
      const amount = calculateDiscount(salePrice, rule);
      setDiscountAmount(amount);
      
      if (typeof amount === 'string') {
        toast({
          title: "Berechnung nicht möglich",
          description: amount,
          variant: "destructive"
        });
      }
    }
    
    setRequestCount(prevCount => prevCount + 1);
  };
  
  const handleCalculate = () => {
    // For immediate merchant contact, show that message right away
    if (rule.returnStrategy === 'contact_merchant_immediately') {
      setShowMerchantContactMessage(true);
      setShowApologyMessage(false);
      setShowDiscountAmount(false);
      setRequestCount(prevCount => prevCount + 1);
      return;
    }
    
    // For other strategies, show apology message first
    setShowApologyMessage(true);
    setShowDiscountAmount(false);
    setShowNegotiatingMessage(false);
    setShowMerchantContactMessage(false);
    
    // Calculate the discount in the background
    calculateAndPrepareDiscount();
  };
  
  const handleForwardSkip = () => {
    // If we're showing the negotiating message, show the calculated discount with the next level
    if (showNegotiatingMessage) {
      setShowNegotiatingMessage(false);
      setShowDiscountAmount(true);
    } else {
      // Otherwise, just show the calculated discount
      setShowApologyMessage(false);
      setShowDiscountAmount(true);
    }
  };
  
  const handleReject = () => {
    // Special handling for discount_then_contact_merchant strategy
    if (rule.returnStrategy === 'discount_then_contact_merchant') {
      setShowDiscountAmount(false);
      setShowNegotiatingMessage(false);
      setShowMerchantContactMessage(true);
      
      toast({
        title: "Händlerkontakt erforderlich",
        description: "Dieser Fall erfordert nun Rücksprache mit dem Händler.",
      });
      
      return;
    }
    
    // Check for multi-stage discount rules
    if (rule.multiStageDiscount && rule.calculationStages) {
      // Try to offer the next higher discount level
      const nextLevel = currentDiscountLevel + 1;
      
      // If we have more discount levels available, show negotiating message first
      if (nextLevel < rule.calculationStages.length) {
        // Hide the discount amount and show negotiating message
        setShowDiscountAmount(false);
        setShowNegotiatingMessage(true);
        
        // Get the next level discount object
        const nextStage = rule.calculationStages[nextLevel];
        
        // Calculate the new amount
        const newAmount = calculateDiscountForStage(salePrice, nextStage, rule);
        
        setDiscountAmount(newAmount);
        setCurrentDiscountLevel(nextLevel);
        
        let valueLabel = '';
        if (nextStage.calculationBase === 'prozent_vom_vk') {
          valueLabel = `${nextStage.value}%`;
        } else if (nextStage.calculationBase === 'fester_betrag') {
          valueLabel = `${formatCurrency(nextStage.value || 0)}`;
        } else {
          valueLabel = 'Preisstaffelung';
        }
        
        toast({
          title: "Angebot erhöht",
          description: `Nachlass auf ${valueLabel} erhöht.`
        });
      } 
      // If we've exhausted all discount levels or if the return strategy is "discount_then_return" or "discount_then_keep"
      else if (rule.returnStrategy === 'discount_then_return' || 
              rule.returnStrategy === 'discount_then_keep') {
        // Show negotiating message
        setShowDiscountAmount(false);
        setShowNegotiatingMessage(true);
        
        // Offer full refund based on return strategy
        if (rule.returnStrategy === 'discount_then_return') {
          handleFullRefundAndReturn();
        } else if (rule.returnStrategy === 'discount_then_keep') {
          handleFullRefundNoReturn();
        } else {
          toast({
            title: "Maximaler Nachlass erreicht",
            description: "Es sind keine höheren Nachlass-Stufen verfügbar.",
            variant: "destructive"
          });
        }
      }
    } 
    // For non-multi-stage rules
    else {
      // Hide the discount amount and show negotiating message
      setShowDiscountAmount(false);
      setShowNegotiatingMessage(true);
      
      // Handle based on return strategy
      if (rule.returnStrategy === 'discount_then_return' && !offeringReturn) {
        handleFullRefundAndReturn();
      } else if (rule.returnStrategy === 'discount_then_keep' && !offeringReturn) {
        handleFullRefundNoReturn();
      } else {
        toast({
          title: "Keine weiteren Angebotsstufen",
          description: "Bei dieser Regel sind keine gestaffelten Angebote verfügbar.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleFullRefundAndReturn = () => {
    // Set full refund as the discount amount (100% of sale price)
    setDiscountAmount(salePrice);
    setOfferingReturn(true);
    
    toast({
      title: "Vollerstattung angeboten",
      description: "Der Kunde erhält eine volle Rückerstattung und muss den Artikel zurücksenden.",
    });
  };
  
  const handleFullRefundNoReturn = () => {
    // Set full refund as the discount amount (100% of sale price) but don't require return
    setDiscountAmount(salePrice);
    setOfferingReturn(false);
    
    toast({
      title: "Vollerstattung angeboten",
      description: "Der Kunde erhält eine volle Rückerstattung und muss den Artikel NICHT zurücksenden.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nachlass berechnen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sale-price">Verkaufspreis (VK)</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="sale-price" 
              type="number" 
              value={salePrice} 
              onChange={(e) => setSalePrice(parseFloat(e.target.value))}
              min={0}
            />
            <div className="text-lg font-medium">€</div>
          </div>
        </div>
        
        {!showApologyMessage && !showNegotiatingMessage && !showDiscountAmount && !showMerchantContactMessage && (
          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="h-4 w-4 mr-2" /> Nachlass berechnen
          </Button>
        )}
        
        {showApologyMessage && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle>{getApologyMessage()}</AlertTitle>
              <AlertDescription>
                Wir senden eine Nachricht an unseren Partner, um nach einem angemessenen Preisnachlass zu fragen. 
                Bitte haben Sie einen Moment Geduld.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleForwardSkip} className="w-full">
              <FastForward className="h-4 w-4 mr-2" /> Vorspulen
            </Button>
          </div>
        )}
        
        {showMerchantContactMessage && (
          <div className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTitle>Händlerkontakt erforderlich</AlertTitle>
              <AlertDescription>
                {rule.returnStrategy === 'contact_merchant_immediately' 
                  ? "Wir müssen dies mit dem Händler besprechen. Wir werden uns in Kürze bei ihnen melden. Vielen Dank für ihre Geduld."
                  : "Wir müssen dies mit dem Händler besprechen."}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {showNegotiatingMessage && (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle>Wir setzen uns erneut für Sie ein!</AlertTitle>
              <AlertDescription>
                Wir sprechen noch einmal mit unserem Partner und versuchen alles Mögliche, 
                um einen höheren Preisnachlass für Sie zu erreichen.
                Bitte haben Sie einen Moment Geduld.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleForwardSkip} className="w-full">
              <FastForward className="h-4 w-4 mr-2" /> Vorspulen
            </Button>
          </div>
        )}
        
        {showDiscountAmount && discountAmount !== null && (
          <div className="mt-4">
            <Alert className="bg-green-50 border-green-200 mb-4">
              <AlertTitle>Vielen Dank für Ihre Geduld!</AlertTitle>
              <AlertDescription>
                {offeringReturn 
                  ? "Leider kann unser Partner keinen weiteren Preisnachlass anbieten. Allerdings können wir Ihnen eine volle Rückerstattung anbieten, wenn Sie den Artikel zurücksenden."
                  : `Wir haben bei dem Partner nachgefragt und können Ihnen einen Preisnachlass von ${typeof discountAmount === 'number' ? formatCurrency(discountAmount) : "0,00 €"} gewähren.`
                }
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Berechneter Nachlass</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-1" /> 
                <span>Anfragen: {requestCount}</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(discountAmount)}</div>
            {typeof discountAmount === 'number' && (
              <>
                <div className="text-sm text-muted-foreground mt-2">Neuer Preis</div>
                <div className="text-lg font-medium">
                  {offeringReturn 
                    ? "Artikel muss zurückgesendet werden" 
                    : formatCurrency(salePrice - discountAmount)}
                </div>
                
                {/* Show reject button in the following cases */}
                {(
                  (rule.multiStageDiscount && 
                   rule.calculationStages && 
                   currentDiscountLevel < rule.calculationStages.length - 1) ||
                  (rule.returnStrategy === 'discount_then_return' && !offeringReturn) ||
                  (rule.returnStrategy === 'discount_then_keep' && discountAmount < salePrice) ||
                  (rule.returnStrategy === 'discount_then_contact_merchant')
                ) && (
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Ablehnen
                  </Button>
                )}
                
                {offeringReturn ? (
                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <div className="font-medium">Retoure erforderlich</div>
                    <div className="text-sm">Der Artikel muss zurückgesendet werden.</div>
                  </div>
                ) : discountAmount === salePrice && rule.returnStrategy === 'discount_then_keep' && (
                  <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md text-green-800">
                    <div className="font-medium">Keine Retoure erforderlich</div>
                    <div className="text-sm">Der Artikel muss NICHT zurückgesendet werden.</div>
                  </div>
                )}
              </>
            )}
            {typeof discountAmount === 'string' && (
              <div className="mt-2 text-sm text-destructive">
                Fehler: Der Nachlass konnte nicht berechnet werden.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCalculator;
