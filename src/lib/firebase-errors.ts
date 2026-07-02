export function firebaseErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err !== null && "code" in err ? String(err.code) : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with that email already exists. Try signing in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before completing.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in yet (Firebase Console → Authentication → Settings → Authorized domains).";
    default:
      return code ? `Something went wrong (${code}). Please try again.` : "Something went wrong. Please try again.";
  }
}
