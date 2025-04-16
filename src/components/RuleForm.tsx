
const returnStrategies: {value: ReturnStrategy; label: string}[] = [
  { value: 'auto_return_full_refund', label: 'Automatische Retoure mit voller Kostenerstattung' },
  { value: 'discount_then_return', label: 'Preisnachlass anbieten, bei Ablehnung Retoure' },
  { value: 'discount_then_keep', label: 'Preisnachlass anbieten, bei Ablehnung volle Erstattung ohne Rücksendung' }
];

const defaultRule: DiscountRule = {
  ...defaultRule,
  returnStrategy: 'auto_return_full_refund' // Set a default strategy
};
