import { getDatabase } from '../database/database';
import { getCurrentMonthId, getPrevMonthId } from '../utils/dates';
import { getEnvelopesForMonth } from './envelope-service';
import { processRecurringIncomeForMonth } from './income-service';

export interface MonthRecord {
  id: string;
  year: number;
  month: number;
  created_at: string;
}

/**
 * Ensures that the given month exists in SQLite.
 * If it is a new month:
 * 1. Creates month entry
 * 2. Processes recurring income (salary)
 * 3. Calculates carry-over per envelope setting from previous month
 * 4. Carries forward previous month's default allocations
 */
export async function ensureMonthExists(monthId?: string): Promise<string> {
  const targetMonthId = monthId || getCurrentMonthId();
  const db = await getDatabase();

  const existingMonth = await db.getFirstAsync<MonthRecord>(
    'SELECT * FROM months WHERE id = ?',
    [targetMonthId]
  );

  if (existingMonth) {
    // Process recurring income in case new recurring entries were added
    await processRecurringIncomeForMonth(targetMonthId);
    return targetMonthId;
  }

  // Create new month record
  const [yearStr, monthStr] = targetMonthId.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO months (id, year, month, created_at) VALUES (?, ?, ?, ?)`,
    [targetMonthId, year, month, now]
  );

  // Process recurring income for this new month
  await processRecurringIncomeForMonth(targetMonthId);

  // Get previous month data for carry-over calculation
  const prevMonthId = getPrevMonthId(targetMonthId);
  const prevEnvelopes = await getEnvelopesForMonth(prevMonthId);

  const activeEnvelopes = await db.getAllAsync<any>(
    'SELECT * FROM envelopes WHERE is_active = 1'
  );

  for (const env of activeEnvelopes) {
    const prevEnvData = prevEnvelopes.find(pe => pe.id === env.id);

    let carryOverAmount = 0;

    // Check carry-over setting for this envelope
    if (env.carry_over_enabled === 1 && prevEnvData) {
      // Remaining balance of previous month becomes carry-over
      carryOverAmount = prevEnvData.remaining_amount;
    }

    // Previous allocation as default
    const prevAllocation = prevEnvData ? prevEnvData.allocated_amount : 0;

    const meId = `me_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db.runAsync(
      `INSERT INTO monthly_envelopes (id, month_id, envelope_id, allocated_amount, carry_over_amount, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [meId, targetMonthId, env.id, prevAllocation, carryOverAmount, now, now]
    );
  }

  return targetMonthId;
}

/**
 * Get list of all recorded months in DB ordered chronologically.
 */
export async function getAllMonths(): Promise<MonthRecord[]> {
  const db = await getDatabase();
  return db.getAllAsync<MonthRecord>('SELECT * FROM months ORDER BY id DESC');
}
