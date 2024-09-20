import Big from 'big.js';

export const bigTransformer = {
  to: (value: Big | null) =>
    value != null && value instanceof Big ? value.toNumber() : null,
  from: (value: number | null) => (value != null ? new Big(value) : null),
};
