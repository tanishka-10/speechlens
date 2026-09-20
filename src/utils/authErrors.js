export const getFriendlyAuthError = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'That email address is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with that email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already in use. Try logging in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/missing-password':
        return 'Please enter a password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
        
      default:
        return 'Something went wrong. Please try again.';
    }
  };
  