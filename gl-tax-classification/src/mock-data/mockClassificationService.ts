import {
  mockStore,
  addHistoryEvent,
  createNewRun,
  completeRunProcessing,
} from '@/mock-data/store';
import { createRng, intBetween, pick } from '@/mock-data/seededRandom';
import { REASONING_TEMPLATES } from '@/mock-data/dataPools';
import { MOCK_USER } from '@/mock-data/authCredentials';
import type {
  ClassificationRun,
  CreateRunPayload,
  RunListParams,
  RunListResult,
} from '@/types/run';
import type {
  LineItem,
  LineItemListParams,
  LineItemListResult,
  RerunLineItemResult,
  UpdateLineItemPayload,
  TaxClassificationCode,
} from '@/types/lineItem';
import type { HistoryEvent } from '@/types/history';
import { messages } from '@/constants/messages';

const rerunRng = createRng(9182736);

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function createClassificationRun(payload: CreateRunPayload): Promise<ClassificationRun> {
  await delay(null, 900);
  const run = createNewRun(payload.runId, payload.glFile.name, payload.provisionFile.name, MOCK_USER.displayName);

  // Simulate async backend processing completing a little later.
  setTimeout(() => {
    completeRunProcessing(run.id);
  }, 8000);

  return delay(run, 0);
}

export async function getRuns(params: RunListParams): Promise<RunListResult> {
  await delay(null, 300);
  let runs = [...mockStore.runs];

  if (params.search) {
    const q = params.search.toLowerCase();
    runs = runs.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.glFileName.toLowerCase().includes(q) ||
        r.provisionFileName.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q),
    );
  }

  if (params.startDate) {
    const start = new Date(`${params.startDate}T00:00:00.000Z`).getTime();
    runs = runs.filter((r) => new Date(r.createdAt).getTime() >= start);
  }

  if (params.endDate) {
    const end = new Date(`${params.endDate}T23:59:59.999Z`).getTime();
    runs = runs.filter((r) => new Date(r.createdAt).getTime() <= end);
  }

  if (params.status && params.status !== 'ALL') {
    runs = runs.filter((r) => r.status === params.status);
  }

  const total = runs.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const paged = runs.slice(start, start + pageSize);

  return { runs: paged, total };
}

export async function getRunStatus(runId: string): Promise<ClassificationRun> {
  await delay(null, 150);
  const run = mockStore.runs.find((r) => r.id === runId);
  if (!run) throw { message: 'Run not found.', status: 404 };
  return run;
}

export async function getRunLineItems(params: LineItemListParams): Promise<LineItemListResult> {
  await delay(null, 350);
  let items = [...(mockStore.lineItemsByRun.get(params.runId) ?? [])];

  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.deliveryNumber.toLowerCase().includes(q) ||
        i.profitCenter.toLowerCase().includes(q) ||
        i.text.toLowerCase().includes(q) ||
        i.vendorName.toLowerCase().includes(q) ||
        i.updatedBy.toLowerCase().includes(q),
    );
  }

  if (params.taxClassification && params.taxClassification !== 'ALL') {
    items = items.filter((i) => i.taxClassification === params.taxClassification);
  }

  if (params.status && params.status !== 'ALL') {
    items = items.filter((i) => i.status === params.status);
  }

  if (params.confidenceBand && params.confidenceBand !== 'ALL') {
    items = items.filter((i) => {
      if (params.confidenceBand === 'HIGH') return i.confidence >= 85;
      if (params.confidenceBand === 'MEDIUM') return i.confidence >= 60 && i.confidence < 85;
      return i.confidence < 60;
    });
  }

  if (params.vendor) {
    items = items.filter((i) => i.vendorName === params.vendor);
  }

  if (params.profitCenter) {
    items = items.filter((i) => i.profitCenter === params.profitCenter);
  }

  const total = items.length;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total };
}

export async function updateLineItem(
  lineItemId: string,
  payload: UpdateLineItemPayload,
): Promise<LineItem> {
  await delay(null, 500);

  let found: LineItem | undefined;
  let runId = '';
  for (const [rId, items] of mockStore.lineItemsByRun.entries()) {
    const idx = items.findIndex((i) => i.id === lineItemId);
    if (idx !== -1) {
      found = items[idx];
      runId = rId;
      break;
    }
  }
  if (!found) throw { message: 'Line item not found.', status: 404 };

  const previousClassification = found.taxClassification;
  const previousStatus = found.status;
  const now = new Date().toISOString();

  const wasTextEdited = payload.text !== undefined && payload.text !== found.text;
  const wasVendorEdited = payload.vendorName !== undefined && payload.vendorName !== found.vendorName;

  found.text = payload.text ?? found.text;
  found.vendorName = payload.vendorName ?? found.vendorName;
  found.taxClassification = payload.taxClassification;
  found.status = payload.status;
  found.updatedAt = now;
  found.updatedBy = MOCK_USER.displayName;
  found.isManuallyEdited = found.isManuallyEdited || payload.taxClassification !== found.aiSuggestedClassification;

  if (wasTextEdited || wasVendorEdited) {
    addHistoryEvent(lineItemId, {
      type: 'MANUAL_EDIT',
      actor: MOCK_USER.displayName,
      timestamp: now,
      detail: wasTextEdited ? 'Transaction text updated.' : 'Vendor name updated.',
    });
  }

  if (payload.taxClassification !== previousClassification) {
    addHistoryEvent(lineItemId, {
      type: 'MANUAL_TAX_CLASSIFICATION',
      actor: MOCK_USER.displayName,
      timestamp: now,
      fromValue: previousClassification,
      toValue: payload.taxClassification,
    });
  }

  if (payload.status !== previousStatus) {
    addHistoryEvent(lineItemId, {
      type: 'REVIEW_STATUS_UPDATED',
      actor: MOCK_USER.displayName,
      timestamp: now,
      fromValue: previousStatus === 'IN_REVIEW' ? 'In Review' : 'Reviewed',
      toValue: payload.status === 'IN_REVIEW' ? 'In Review' : 'Reviewed',
    });
  }

  // Update run-level review progress
  const run = mockStore.runs.find((r) => r.id === runId);
  if (run) {
    const items = mockStore.lineItemsByRun.get(runId) ?? [];
    run.reviewedLineItems = items.filter((i) => i.status === 'REVIEWED').length;
    run.updatedAt = now;
    if (run.status === 'READY_FOR_REVIEW') {
      run.status = 'IN_REVIEW';
    }
  }

  return found;
}

export async function rerunLineItem(lineItemId: string): Promise<RerunLineItemResult> {
  await delay(null, 1200);

  let found: LineItem | undefined;
  for (const items of mockStore.lineItemsByRun.values()) {
    const item = items.find((i) => i.id === lineItemId);
    if (item) {
      found = item;
      break;
    }
  }
  if (!found) throw { message: messages.errors.rerunFailed, status: 404 };

  const classifications: TaxClassificationCode[] = [
    'RE',
    'NON_QUALIFYING',
    'AA_10',
    'AA_14',
    'CUSTOM_SOFTWARE_20',
    'ICT_20',
  ];

  const now = new Date().toISOString();
  const newClassification = pick(rerunRng, classifications);
  const newConfidence = intBetween(rerunRng, 70, 99);
  const newReasoning = pick(rerunRng, REASONING_TEMPLATES);

  found.aiSuggestedClassification = newClassification;
  found.confidence = newConfidence;
  found.llmReasoning = newReasoning;
  found.rerunCount += 1;
  found.updatedAt = now;

  addHistoryEvent(lineItemId, {
    type: 'CLASSIFICATION_RERUN',
    actor: MOCK_USER.displayName,
    timestamp: now,
  });
  addHistoryEvent(lineItemId, {
    type: 'AI_RESULT_UPDATED',
    actor: 'System',
    timestamp: new Date(Date.now() + 1000).toISOString(),
    toValue: newClassification,
    confidence: newConfidence,
  });

  return {
    aiSuggestedClassification: newClassification,
    confidence: newConfidence,
    llmReasoning: newReasoning,
  };
}

export async function getLineItemHistory(lineItemId: string): Promise<HistoryEvent[]> {
  await delay(null, 250);
  return [...(mockStore.historyByLineItem.get(lineItemId) ?? [])].sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : 1,
  );
}

export async function finalizeRun(runId: string): Promise<ClassificationRun> {
  await delay(null, 1000);
  const run = mockStore.runs.find((r) => r.id === runId);
  if (!run) throw { message: 'Run not found.', status: 404 };
  if (run.reviewedLineItems < run.totalLineItems) {
    throw { message: messages.errors.finalizeFailed, status: 409 };
  }
  run.status = 'FINALIZED';
  run.kpmgExcelAvailable = true;
  run.updatedAt = new Date().toISOString();
  return run;
}
