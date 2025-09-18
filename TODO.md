# TODO: Implement Forget Password Feature

## Backend Changes
- [x] Update User model to add resetPasswordToken and resetPasswordExpires fields
- [x] Add requestPasswordReset function in authController.js
- [x] Add resetPassword function in authController.js
- [x] Add /forgot-password and /reset-password routes in authRoutes.js

## Frontend Changes
- [x] Add "Forgot Password" link to Login.jsx
- [x] Create ForgotPassword.jsx page
- [x] Create ResetPassword.jsx page
- [x] Update App.jsx to add routes for new pages

## Testing
- [x] Test password reset flow
- [x] Verify error handling and validation
