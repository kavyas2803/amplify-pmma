export const APP_NAME = 'GL Tax Classification';
export const APP_OWNER = 'Panasonic';

export const labels = {
  actions: {
    view: 'View',
    download: 'Download',
    downloadKpmg: 'Download KPMG Excel',
    edit: 'Edit',
    viewHistory: 'View History',
    newUpload: 'New Upload',
    rerunClassification: 'Re-run Classification',
    save: 'Save Changes',
    cancel: 'Cancel',
    finalize: 'Finalize & Generate KPMG Excel',
    logout: 'Logout',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    backToClassification: 'Back to Classification',
  },
  pages: {
    login: 'Sign In',
    dashboard: 'Dashboard',
    classification: 'Classification',
    classificationResults: 'Classification Results',
  },
  upload: {
    glFileLabel: 'SAP GL Export',
    provisionFileLabel: 'Provision File',
    dragHint: 'Click or drag file to this area to upload',
    acceptedTypes: 'Accepted formats: .xlsx, .xls, .csv (max 10MB, up to 100 line items)',
  },
} as const;
