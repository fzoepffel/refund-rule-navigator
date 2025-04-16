
export const getReturnStrategyLabel = (strategy: ReturnStrategy): string => {
  const labels: Record<ReturnStrategy, string> = {
    'auto_return_full_refund': 'Automatische Rückerstattung bei Retoure',
    'discount_then_return': 'Rabatt anbieten, dann Retoure',
    'discount_then_keep': 'Rabatt anbieten, Artikel behalten'
  };
  return labels[strategy];
};
