const errorKeyMap: Record<string, string> = {
  "Invalid email address": "validation.invalid_email",
  "Invalid email": "validation.invalid_email",
  "Password is required": "validation.password_required",
  "Name is required": "validation.name_required",
  "Name is too long": "validation.name_too_long",
  "At least 8 characters": "validation.password_min_length",
  "Need a lowercase letter": "validation.password_lowercase",
  "Need an uppercase letter": "validation.password_uppercase",
  "Need a digit": "validation.password_digit",
  "Passwords do not match": "validation.passwords_mismatch",
};

export function translateFieldError(
  message: string | undefined,
  t: (key: string) => string,
): string | undefined {
  if (!message) return undefined;
  const key = errorKeyMap[message];
  return key ? t(key) : message;
}
