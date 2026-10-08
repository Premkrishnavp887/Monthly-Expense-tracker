/**
 * Financial Precision Utility
 * All monetary amounts in Envelope Budget are stored as integer PAISE (1 INR = 100 Paise).
 * Example: ₹800.50 -> 80050 paise
 *          ₹20,000 -> 2000000 paise
 */

/**
 * Converts float or string rupees into integer paise.
 * Handles Indian formatted strings like "20,000" or "1,25,000.50"
 */
export function parseINRToPaise(input: string | number): number {
  if (typeof input === 'number') {
    if (isNaN(input)) return 0;
    return Math.round(input * 100);
  }

  if (!input || typeof input !== 'string') return 0;

  // Remove currency symbol, commas, and whitespace
  const cleanStr = input.replace(/[₹,\s]/g, '').trim();
  if (!cleanStr) return 0;

  const num = parseFloat(cleanStr);
  if (isNaN(num)) return 0;

  return Math.round(num * 100);
}

/**
 * Converts integer paise into float rupees.
 */
export function paiseToRupees(paise: number): number {
  return (paise || 0) / 100;
}

/**
 * Formats integer paise to standard Indian Rupee representation (en-IN).
 * Examples:
 *   2000000 -> "₹20,000"
 *   80050   -> "₹800.50" (if showDecimals = true or paise % 100 !== 0)
 *   -20000  -> "-₹200"
 */
export function formatINR(paise: number, forceDecimals = false): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise || 0);
  const rupees = absPaise / 100;

  const hasDecimals = forceDecimals || absPaise % 100 !== 0;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  const formattedStr = formatter.format(rupees);
  const result = `₹${formattedStr}`;

  return isNegative ? `-${result}` : result;
}

/**
 * Validates if an allocation total does not exceed total income.
 */
export function validateAllocation(
  incomePaise: number,
  allocations: Record<string, number>
): { isValid: boolean; totalAllocatedPaise: number; unallocatedPaise: number } {
  const totalAllocatedPaise = Object.values(allocations).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const unallocatedPaise = incomePaise - totalAllocatedPaise;

  return {
    isValid: unallocatedPaise >= 0,
    totalAllocatedPaise,
    unallocatedPaise,
  };
}
