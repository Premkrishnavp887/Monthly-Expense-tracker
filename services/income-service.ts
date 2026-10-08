import { getDatabase } from '../database/database';
import { getEnvelopesForMonth } from './envelope-service';

export interface IncomeEntry {
  id: string;
  month_id: string;
  amount: number; // in paise
  source: string;
  date: string;
  notes?: string;
  recurring_income_id?: string;
  created_at: string;
}

export interface RecurringIncomeEntry {
  id: string;
  source: string;
  amount: number; // in paise
  day_of_month: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

/**
 * Adds single income entry for a month.
 */
export async function addIncome(
  monthId: string,
  amountPaise: number,
  source: string,
  date: string,
  notes?: string,
  recurringIncomeId?: string
): Promise<string> {
  const db = await getDatabase();
  const id = `inc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO income (id, month_id, amount, source, date, notes, recurring_income_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, monthId, amountPaise, source, date, notes || null, recurringIncomeId || null, now]
  );

  return id;
}

/**
 * Gets total monthly income in paise for a given month.
 */
export async function getTotalIncomeForMonth(monthId: string): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<IncomeEntry>(
    'SELECT * FROM income WHERE month_id = ?',
    [monthId]
  );
  return rows.reduce((sum, inc) => sum + (inc.amount || 0), 0);
}

/**
 * Saves monthly allocations for envelopes.
 */
export async function saveAllocationsForMonth(
  monthId: string,
  allocations: Record<string, number> // envelope_id -> amount in paise
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  for (const [envelopeId, amountPaise] of Object.entries(allocations)) {
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM monthly_envelopes WHERE month_id = ? AND envelope_id = ?',
      [monthId, envelopeId]
    );

    if (existing) {
      await db.runAsync(
        `UPDATE monthly_envelopes SET allocated_amount = ?, updated_at = ? WHERE id = ?`,
        [amountPaise, now, existing.id]
      );
    } else {
      const id = `me_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await db.runAsync(
        `INSERT INTO monthly_envelopes (id, month_id, envelope_id, allocated_amount, carry_over_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [id, monthId, envelopeId, amountPaise, now, now]
      );
    }
  }
}

/**
 * Gets summary of income, allocations, spent, and unallocated remaining for a month.
 */
export async function getMonthSummary(monthId: string) {
  const totalIncomePaise = await getTotalIncomeForMonth(monthId);
  const envelopes = await getEnvelopesForMonth(monthId);

  const totalAllocatedPaise = envelopes.reduce((sum, e) => sum + e.allocated_amount, 0);
  const totalSpentPaise = envelopes.reduce((sum, e) => sum + e.spent_amount, 0);
  const unallocatedPaise = totalIncomePaise - totalAllocatedPaise;
  const totalRemainingPaise = totalIncomePaise - totalSpentPaise;

  const spentPercentage = totalIncomePaise > 0
    ? Math.min(Math.round((totalSpentPaise / totalIncomePaise) * 100), 100)
    : 0;

  return {
    totalIncomePaise,
    totalAllocatedPaise,
    totalSpentPaise,
    unallocatedPaise,
    totalRemainingPaise,
    spentPercentage,
    envelopes,
  };
}

/**
 * Creates or updates a recurring income template.
 */
export async function saveRecurringIncome(
  source: string,
  amountPaise: number,
  dayOfMonth = 1,
  id?: string
): Promise<string> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  if (id) {
    await db.runAsync(
      `UPDATE recurring_income SET source = ?, amount = ?, day_of_month = ?, updated_at = ?
       WHERE id = ?`,
      [source, amountPaise, dayOfMonth, now, id]
    );
    return id;
  } else {
    const newId = `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db.runAsync(
      `INSERT INTO recurring_income (id, source, amount, day_of_month, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, source, amountPaise, dayOfMonth, 1, now, now]
    );
    return newId;
  }
}

/**
 * Process recurring income for a new month. Deduplicates if app is opened multiple times!
 */
export async function processRecurringIncomeForMonth(monthId: string): Promise<number> {
  const db = await getDatabase();
  const recurringList = await db.getAllAsync<RecurringIncomeEntry>(
    'SELECT * FROM recurring_income WHERE is_active = 1'
  );

  let addedCount = 0;

  for (const rec of recurringList) {
    // Check if recurring income was already generated for this month
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM income WHERE month_id = ? AND recurring_income_id = ?',
      [monthId, rec.id]
    );

    if (!existing) {
      const [year, month] = monthId.split('-');
      const dayStr = String(rec.day_of_month).padStart(2, '0');
      const dateStr = `${year}-${month}-${dayStr}`;

      await addIncome(
        monthId,
        rec.amount,
        rec.source,
        dateStr,
        'Recurring monthly salary/income',
        rec.id
      );
      addedCount++;
    }
  }

  return addedCount;
}

/**
 * Get all active recurring incomes
 */
export async function getRecurringIncomes(): Promise<RecurringIncomeEntry[]> {
  const db = await getDatabase();
  return db.getAllAsync<RecurringIncomeEntry>(
    'SELECT * FROM recurring_income WHERE is_active = 1 ORDER BY created_at DESC'
  );
}
