import { env } from '@/config/environment';
import * as realClassificationService from '@/services/api/classificationService';
import * as mockClassificationService from '@/mock-data/mockClassificationService';
import * as realDownloadService from '@/services/api/downloadService';
import * as mockDownloadService from '@/mock-data/mockDownloadService';

const classificationImpl = env.useMockData ? mockClassificationService : realClassificationService;
const downloadImpl = env.useMockData ? mockDownloadService : realDownloadService;

export const {
  createClassificationRun,
  getRuns,
  getRunStatus,
  getRunLineItems,
  updateLineItem,
  rerunLineItem,
  getLineItemHistory,
  finalizeRun,
} = classificationImpl;

export const { downloadSourceFiles, downloadKpmgExcel } = downloadImpl;
