const MESSAGES = {
    USER_NOT_EXISTS: 'User does not exist',
    USER_ALREADY_EXISTS: 'User with the given email or phone already exists',
    USER_PHONE_ALREADY_EXISTS: 'User with the given phone already exists',
    USER_EMAIL_ALREADY_EXISTS: 'User with the given email already exists',
    LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED: 'Sorry, your account is deactivated. Please contact administrator for more details',
    LOGIN_ERROR_USER_SESSION_OVERRIDE: 'Invalid email or OTP, please try again',
    LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID: 'Sorry, you are not authorised. Please login again to continue',
    TIMEZONE_ERROR: 'startTime must be less than or equal to endTime',
    INVALID_DATE: 'Invalid date format'
};

export default MESSAGES;