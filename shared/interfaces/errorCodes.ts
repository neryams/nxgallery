export const ErrorCodes = {
  missingRequiredFields: {
    status: 400,
    code: 'MISSING_REQD_FIELDS',
    message: 'Missing required fields'
  },
  userAlreadyCreated: {
    status: 403,
    code: 'USER_ALREADY_CREATED',
    message: 'Administrator account has already been created. Please log in using your credentials instead.'
  },
  notAuthenticated: {
    status: 403,
    code: 'NOT_AUTHENTICATED',
    message: 'Credentials were incorrect.'
  }
}