import type { TaxClassificationCode } from '@/types/lineItem';

export const TAX_CLASSIFICATION_LABEL: Record<TaxClassificationCode, string> = {
  RE: 'RE — Revenue Expenditure',
  NON_QUALIFYING: 'Non-Qualifying Expenditure',
  AA_10: 'AA 10%',
  AA_14: 'AA 14%',
  CUSTOM_SOFTWARE_20: 'Custom Software — 20%',
  ICT_20: 'ICT 20%',
  PROVISION: 'Provision',
};

// Short label used in dense table cells
export const TAX_CLASSIFICATION_SHORT_LABEL: Record<TaxClassificationCode, string> = {
  RE: 'RE',
  NON_QUALIFYING: 'Non-Qualifying',
  AA_10: 'AA 10%',
  AA_14: 'AA 14%',
  CUSTOM_SOFTWARE_20: 'Custom Software 20%',
  ICT_20: 'ICT 20%',
  PROVISION: 'Provision',
};

export const TAX_CLASSIFICATION_OPTIONS = (
  Object.keys(TAX_CLASSIFICATION_LABEL) as TaxClassificationCode[]
).map((value) => ({
  value,
  label: TAX_CLASSIFICATION_LABEL[value],
}));

export const CONFIDENCE_BAND_OPTIONS = [
  { value: 'ALL', label: 'All Confidence' },
  { value: 'HIGH', label: 'High (≥ 85%)' },
  { value: 'MEDIUM', label: 'Medium (60–84%)' },
  { value: 'LOW', label: 'Low (< 60%)' },
];

export function getConfidenceBand(confidence: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (confidence >= 85) return 'HIGH';
  if (confidence >= 60) return 'MEDIUM';
  return 'LOW';
}

export const LOW_CONFIDENCE_THRESHOLD = 60;
