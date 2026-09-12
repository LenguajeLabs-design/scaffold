export function isValidCode(code: unknown): boolean {
  if (typeof code !== "string" || code.length > 128) return false;
  const codes = (process.env.VALID_ACCESS_CODES ?? "").split(",").map(c => c.trim().toUpperCase()).filter(Boolean);
  return codes.includes(code.trim().toUpperCase());
}
