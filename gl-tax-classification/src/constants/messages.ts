export const messages = {
  errors: {
    loadRuns: 'Unable to load runs. Please try again.',
    loadLineItems: 'Unable to load line items. Please try again.',
    saveChanges: 'Unable to save changes. Please try again.',
    rerunFailed: 'Classification re-run failed. Please try again.',
    downloadFailed: 'Unable to download the file.',
    finalizeFailed: 'Unable to finalize the run. Please try again.',
    uploadFailed: 'Upload failed. Please check the files and try again.',
    invalidCredentials: 'Invalid email or password.',
    genericLogin: 'Unable to sign in. Please try again.',
  },
  validation: {
    fileRequired: 'Please select a file.',
    invalidFileType: 'Unsupported file type. Please upload an Excel or CSV file.',
    fileTooLarge: 'File exceeds the 10MB size limit.',
    tooManyLineItems: 'This file exceeds the 100 line item limit for this POC.',
    emailRequired: 'Please enter your email.',
    passwordRequired: 'Please enter your password.',
  },
  empty: {
    noRuns: 'No classification runs yet.',
    noRunsSearch: 'No runs match your search.',
    noLineItems: 'No line items found.',
    noLineItemsSearch: 'No line items match your search.',
    noHistory: 'No activity has been recorded for this line item.',
  },
  success: {
    uploadStarted: 'Upload received. Classification is processing.',
    changesSaved: 'Changes saved.',
    rerunComplete: 'Classification re-run complete.',
    finalized: 'Run finalized. KPMG Excel is ready for download.',
  },
  info: {
    processingNotice:
      'This run is processing in the background. You can navigate away and come back anytime.',
    reviewIncomplete: (remaining: number) =>
      `${remaining} line item${remaining === 1 ? '' : 's'} still require review.`,
    reviewComplete: 'Review complete.',
  },
} as const;
