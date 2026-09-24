/** Korean phone numbers: shops store them normalised so one customer is one phone number. */

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** "01012345678" → "010-1234-5678", "0212345678" → "02-1234-5678". Partial input is formatted as typed. */
export function formatPhone(value: string): string {
  const digits = phoneDigits(value).slice(0, 11);
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const digits = phoneDigits(value);
  if (!digits.startsWith("0") || digits.length < 9 || digits.length > 11) return false;
  if (digits.startsWith("01")) return digits.length >= 10;
  return true;
}
