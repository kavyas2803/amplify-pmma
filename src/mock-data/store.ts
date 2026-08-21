import { createRng, intBetween, pick } from '@/mock-data/seededRandom';
import {
  VENDORS,
  TEXT_DESCRIPTIONS,
  PROFIT_CENTERS,
  REASONING_TEMPLATES,
} from '@/mock-data/dataPools';
import type { ClassificationRun, RunStatus } from '@/types/run';
import type { LineItem, TaxClassificationCode } from '@/types/lineItem';
import type { HistoryEvent, HistoryEventType } from '@/types/history';

const rng = createRng(20260819);

const CLASSIFICATIONS: TaxClassificationCode[] = [
  'RE',
  'NON_QUALIFYING',
  'AA_10',
  'AA_14',
  'CUSTOM_SOFTWARE_20',
  'ICT_20',
  'PROVISION',
];

let runIdCounter = 1;
let lineItemIdCounter = 1;
let historyIdCounter = 1;

function nextRunId() {
  return `RUN-${String(runIdCounter++).padStart(4, '0')}`;
}
function nextLineItemId() {
  return `LI-${String(lineItemIdCounter++).padStart(6, '0')}`;
}
function nextHistoryId() {
  return `HIST-${String(historyIdCounter++).padStart(6, '0')}`;
}

function isoMinusHours(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function isoMinusDays(days: number, hourOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}

function makeDeliveryNumber(rngFn: () => number): string {
  return String(intBetween(rngFn, 450000, 459999));
}

function generateLineItem(runId: string, index: number, createdAt: string): LineItem {
  const classification = pick(rng, CLASSIFICATIONS);
  const confidence = intBetween(rng, 42, 99);
  const text = pick(rng, TEXT_DESCRIPTIONS);
  const isProvision = classification === 'PROVISION';
  const isManuallyEdited = rng() < 0.18;
  const isReviewed = rng() < 0.55;
  const rerunCount = rng() < 0.12 ? intBetween(rng, 1, 2) : 0;

  const aiSuggested = isProvision
    ? 'PROVISION'
    : pick(
        rng,
        CLASSIFICATIONS.filter((c) => c !== 'PROVISION'),
      );

  const finalClassification = isManuallyEdited
    ? pick(rng, CLASSIFICATIONS)
    : aiSuggested;

  const updatedAt = isManuallyEdited || rerunCount > 0 ? isoMinusHours(intBetween(rng, 1, 40)) : createdAt;

  return {
    id: nextLineItemId(),
    runId,
    deliveryNumber: makeDeliveryNumber(rng),
    profitCenter: pick(rng, PROFIT_CENTERS),
    text,
    vendorName: pick(rng, VENDORS),
    amount: Number((intBetween(rng, 150, 850000) / (rng() < 0.4 ? 100 : 1)).toFixed(2)),
    currency: 'MYR',
    aiSuggestedClassification: aiSuggested,
    confidence,
    llmReasoning: pick(rng, REASONING_TEMPLATES),
    taxClassification: finalClassification,
    status: isReviewed ? 'REVIEWED' : 'IN_REVIEW',
    createdAt,
    updatedAt,
    updatedBy: isManuallyEdited || isReviewed ? pick(rng, ['John Tan', 'Priya Nair', 'Ahmad Fauzi', 'Finance User']) : 'System',
    isManuallyEdited,
    rerunCount,
  };
}

function generateHistoryForLineItem(item: LineItem): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  const baseTime = new Date(item.createdAt);

  events.push({
    id: nextHistoryId(),
    lineItemId: item.id,
    type: 'INITIAL_CLASSIFICATION',
    actor: 'System',
    timestamp: baseTime.toISOString(),
    toValue: item.aiSuggestedClassification,
    confidence: item.confidence,
  });

  let cursor = new Date(baseTime.getTime() + 5 * 60000);

  if (item.rerunCount > 0) {
    events.push({
      id: nextHistoryId(),
      lineItemId: item.id,
      type: 'MANUAL_EDIT',
      actor: item.updatedBy,
      timestamp: cursor.toISOString(),
      detail: 'Transaction text updated prior to re-run.',
    });
    cursor = new Date(cursor.getTime() + 2 * 60000);

    events.push({
      id: nextHistoryId(),
      lineItemId: item.id,
      type: 'CLASSIFICATION_RERUN',
      actor: item.updatedBy,
      timestamp: cursor.toISOString(),
    });
    cursor = new Date(cursor.getTime() + 1 * 60000);

    events.push({
      id: nextHistoryId(),
      lineItemId: item.id,
      type: 'AI_RESULT_UPDATED',
      actor: 'System',
      timestamp: cursor.toISOString(),
      toValue: item.aiSuggestedClassification,
      confidence: item.confidence,
    });
    cursor = new Date(cursor.getTime() + 3 * 60000);
  }

  if (item.isManuallyEdited) {
    events.push({
      id: nextHistoryId(),
      lineItemId: item.id,
      type: 'MANUAL_TAX_CLASSIFICATION',
      actor: item.updatedBy,
      timestamp: cursor.toISOString(),
      fromValue: item.aiSuggestedClassification,
      toValue: item.taxClassification,
    });
    cursor = new Date(cursor.getTime() + 1 * 60000);
  }

  if (item.status === 'REVIEWED') {
    events.push({
      id: nextHistoryId(),
      lineItemId: item.id,
      type: 'REVIEW_STATUS_UPDATED',
      actor: item.updatedBy,
      timestamp: cursor.toISOString(),
      fromValue: 'In Review',
      toValue: 'Reviewed',
    });
  }

  return events;
}

interface RunSeed {
  glFileName: string;
  provisionFileName: string;
  status: RunStatus;
  itemCount: number;
  createdDaysAgo: number;
  createdBy: string;
  failureReason?: string;
}

const RUN_SEEDS: RunSeed[] = [
  {
    glFileName: 'GL_August_2026.xlsx',
    provisionFileName: 'Provision_August_2026.xlsx',
    status: 'IN_REVIEW',
    itemCount: 100,
    createdDaysAgo: 1,
    createdBy: 'Finance User',
  },
  {
    glFileName: 'GL_July_2026.xlsx',
    provisionFileName: 'Provision_July_2026.xlsx',
    status: 'FINALIZED',
    itemCount: 42,
    createdDaysAgo: 20,
    createdBy: 'Priya Nair',
  },
  {
    glFileName: 'GL_June_2026.xlsx',
    provisionFileName: 'Provision_June_2026.xlsx',
    status: 'FINALIZED',
    itemCount: 38,
    createdDaysAgo: 50,
    createdBy: 'Ahmad Fauzi',
  },
  {
    glFileName: 'GL_Aug_Batch2_2026.xlsx',
    provisionFileName: 'Provision_Aug_Batch2_2026.xlsx',
    status: 'READY_FOR_REVIEW',
    itemCount: 24,
    createdDaysAgo: 0.2,
    createdBy: 'Finance User',
  },
  {
    glFileName: 'GL_NonTrade_Adj_2026.xlsx',
    provisionFileName: 'Provision_NonTrade_Adj_2026.xlsx',
    status: 'PROCESSING',
    itemCount: 0,
    createdDaysAgo: 0.02,
    createdBy: 'Finance User',
  },
  {
    glFileName: 'GL_Logistics_NLS_2026.xlsx',
    provisionFileName: 'Provision_Logistics_NLS_2026.xlsx',
    status: 'FAILED',
    itemCount: 0,
    createdDaysAgo: 3,
    createdBy: 'John Tan',
    failureReason: 'Provision file could not be parsed — unsupported column layout.',
  },
  {
    glFileName: 'GL_May_2026.xlsx',
    provisionFileName: 'Provision_May_2026.xlsx',
    status: 'FINALIZED',
    itemCount: 55,
    createdDaysAgo: 80,
    createdBy: 'Priya Nair',
  },
  {
    glFileName: 'GL_TAP_Adjustments_Aug_2026.xlsx',
    provisionFileName: 'Provision_TAP_Adjustments_Aug_2026.xlsx',
    status: 'IN_REVIEW',
    itemCount: 17,
    createdDaysAgo: 2,
    createdBy: 'Ahmad Fauzi',
  },
];

interface Store {
  runs: ClassificationRun[];
  lineItemsByRun: Map<string, LineItem[]>;
  historyByLineItem: Map<string, HistoryEvent[]>;
}

function buildStore(): Store {
  const runs: ClassificationRun[] = [];
  const lineItemsByRun = new Map<string, LineItem[]>();
  const historyByLineItem = new Map<string, HistoryEvent[]>();

  for (const seed of RUN_SEEDS) {
    const runId = nextRunId();
    const createdAt = isoMinusDays(seed.createdDaysAgo);
    const items: LineItem[] = [];

    for (let i = 0; i < seed.itemCount; i++) {
      const itemCreatedAt = isoMinusDays(seed.createdDaysAgo, intBetween(rng, 0, 4));
      const item = generateLineItem(runId, i, itemCreatedAt);
      items.push(item);
      historyByLineItem.set(item.id, generateHistoryForLineItem(item));
    }

    lineItemsByRun.set(runId, items);

    const reviewedCount = items.filter((i) => i.status === 'REVIEWED').length;
    const latestUpdate = items.length
      ? items.reduce((latest, i) => (i.updatedAt > latest ? i.updatedAt : latest), createdAt)
      : createdAt;

    runs.push({
      id: runId,
      createdAt,
      updatedAt: latestUpdate,
      glFileName: seed.glFileName,
      provisionFileName: seed.provisionFileName,
      totalLineItems: seed.itemCount,
      reviewedLineItems: seed.status === 'FINALIZED' ? seed.itemCount : reviewedCount,
      status: seed.status,
      createdBy: seed.createdBy,
      failureReason: seed.failureReason,
      kpmgExcelAvailable: seed.status === 'FINALIZED',
    });
  }

  // Sort newest first
  runs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return { runs, lineItemsByRun, historyByLineItem };
}

export const mockStore = buildStore();

export function addHistoryEvent(lineItemId: string, event: Omit<HistoryEvent, 'id' | 'lineItemId'>) {
  const existing = mockStore.historyByLineItem.get(lineItemId) ?? [];
  const newEvent: HistoryEvent = { ...event, id: nextHistoryId(), lineItemId };
  mockStore.historyByLineItem.set(lineItemId, [...existing, newEvent]);
  return newEvent;
}

export function createNewRun(
  runId: string,
  glFileName: string,
  provisionFileName: string,
  createdBy: string,
): ClassificationRun {
  const createdAt = new Date().toISOString();
  const run: ClassificationRun = {
    id: runId,
    createdAt,
    updatedAt: createdAt,
    glFileName,
    provisionFileName,
    totalLineItems: 0,
    reviewedLineItems: 0,
    status: 'PROCESSING',
    createdBy,
    kpmgExcelAvailable: false,
  };
  mockStore.runs.unshift(run);
  mockStore.lineItemsByRun.set(runId, []);
  return run;
}

// Simulates the run finishing processing: generates line items and flips status.
export function completeRunProcessing(runId: string) {
  const run = mockStore.runs.find((r) => r.id === runId);
  if (!run) return;

  const itemCount = intBetween(rng, 15, 60);
  const items: LineItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    const item = generateLineItem(runId, i, new Date().toISOString());
    item.status = 'IN_REVIEW';
    items.push(item);
    mockStore.historyByLineItem.set(item.id, [
      {
        id: nextHistoryId(),
        lineItemId: item.id,
        type: 'INITIAL_CLASSIFICATION' as HistoryEventType,
        actor: 'System',
        timestamp: new Date().toISOString(),
        toValue: item.aiSuggestedClassification,
        confidence: item.confidence,
      },
    ]);
  }
  mockStore.lineItemsByRun.set(runId, items);
  run.totalLineItems = itemCount;
  run.reviewedLineItems = 0;
  run.status = 'READY_FOR_REVIEW';
  run.updatedAt = new Date().toISOString();
}
