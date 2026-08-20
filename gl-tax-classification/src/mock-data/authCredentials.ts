// Mock authentication credentials for the frontend prototype.
// This file is intentionally isolated from the Login UI and the auth service
// interface, so it can be deleted outright once real authentication (Cognito)
// is wired up without touching any calling code.

export const MOCK_CREDENTIALS = {
  email: 'admin@panasonic.com',
  password: 'Demo@2025',
};

export const MOCK_USER = {
  email: 'admin@panasonic.com',
  displayName: 'Finance User',
  role: 'Finance Admin',
};
