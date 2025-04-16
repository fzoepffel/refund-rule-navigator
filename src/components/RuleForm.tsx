
import React from "react";
import { DiscountRule, ReturnStrategy } from "../models/ruleTypes";

// Define default rule first before using it
const defaultRule: DiscountRule = {
  id: "",
  name: "",
  requestType: "",
  requestCategory: "",
  returnStrategy: "auto_return_full_refund", // Set a default strategy
  triggers: [],
  calculationBase: "fester_betrag",
  roundingRule: "keine_rundung",
  returnHandling: "automatisches_label",
  shippingType: "paket"
};

const returnStrategies: {value: ReturnStrategy; label: string}[] = [
  { value: 'auto_return_full_refund', label: 'Automatische Retoure mit voller Kostenerstattung' },
  { value: 'discount_then_return', label: 'Preisnachlass anbieten, bei Ablehnung Retoure' },
  { value: 'discount_then_keep', label: 'Preisnachlass anbieten, bei Ablehnung volle Erstattung ohne Rücksendung' }
];

interface RuleFormProps {
  rule?: DiscountRule;
  onSave: (rule: DiscountRule) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ rule, onSave, onCancel }) => {
  // Form implementation would go here
  return (
    <div>
      {/* Form implementation */}
      <p>Rule Form Component (To be implemented)</p>
    </div>
  );
};

export default RuleForm;
