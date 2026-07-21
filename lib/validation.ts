// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation (alphanumeric and underscores, 3-20 chars)
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

// Name validation (2-50 chars, letters and spaces)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name);
};

// Sanitize input by trimming whitespace
export const sanitizeInput = (input: string): string => {
  return input.trim();
};

// Format error message based on status code and message contents
export const getErrorMessage = (status: number, defaultMessage: string): string => {
  const msg = defaultMessage ? defaultMessage.toLowerCase() : "";

  // Check specific substring patterns first to override generic status codes
  if (
    msg.includes("already exists") ||
    msg.includes("email already registered") ||
    msg.includes("already registered") ||
    msg.includes("duplicate key") ||
    status === 409
  ) {
    return "This email is already registered. Please login or use a different email.";
  }

  if (
    msg.includes("authentication") ||
    msg.includes("credential") ||
    msg.includes("user not found") ||
    msg.includes("incorrect") ||
    status === 401
  ) {
    return "Incorrect email or password.";
  }

  const errorMessages: { [key: number]: string } = {
    400: "Invalid input. Please check your information.",
    401: "Incorrect email or password.",
    409: "This account already exists.",
    429: "Too many login attempts. Please try again later.",
    500: "Server error. Please try again later.",
    503: "Service unavailable. Please try again later.",
  };

  return errorMessages[status] || defaultMessage;
};
