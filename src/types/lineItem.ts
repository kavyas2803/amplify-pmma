export type TaxClassificationCode =
  | 'RE'
  | 'NON_QUALIFYING'
  | 'AA_10'
  | 'AA_14'
  | 'CUSTOM_SOFTWARE_20'
  | 'ICT_20'
  | 'PROVISION';

export type LineItemStatus = 'IN_REVIEW' | 'REVIEWED';

export interface LineItem {
  id: string;
  runId: string;
  deliveryNumber: string;
  profitCenter: string;
  text: string;
  vendorName: string;
  amount: number;
  currency: string;
  aiSuggestedClassification: TaxClassificationCode;
  confidence: number; // 0-100
  llmReasoning: string;
  taxClassification: TaxClassificationCode;
  status: LineItemStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  isManuallyEdited: boolean;
  rerunCount: number;
}

export interface LineItemListParams {
  runId: string;
  search?: string;
  taxClassification?: TaxClassificationCode | 'ALL';
  status?: LineItemStatus | 'ALL';
  confidenceBand?: 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL';
  vendor?: string;
  profitCenter?: string;
  page?: number;
  pageSize?: number;
}

export interface LineItemListResult {
  items: LineItem[];
  total: number;
}

export interface UpdateLineItemPayload {
  text?: string;
  vendorName?: string;
  taxClassification: TaxClassificationCode;
  status: LineItemStatus;
}

export interface RerunLineItemResult {
  aiSuggestedClassification: TaxClassificationCode;
  confidence: number;
  llmReasoning: string;
}
