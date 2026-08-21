import { messages } from '@/constants/messages';

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUploadFile(file: File | null | undefined): FileValidationResult {
  if (!file) {
    return { valid: false, error: messages.validation.fileRequired };
  }

  const lowerName = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasValidExtension) {
    return { valid: false, error: messages.validation.invalidFileType };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: messages.validation.fileTooLarge };
  }

  return { valid: true };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
