import { getDatabase } from '../database/database';

export interface Envelope {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: number;
  carry_over_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface EnvelopeWithBalance extends Envelope {
  allocated_amount: number;   // in paise
  carry_over_amount: number;  // in paise
  spent_amount: number;       // in paise (EXPENSE)
  transfers_in: number;       // in paise
  transfers_out: number;      // in paise
  remaining_amount: number;   // in paise
  spent_percentage: number;   // e.g. 80 (80%)
}

/**
 * Gets all active envelopes with calculated balances for a specific month.
 */
export async function getEnvelopesForMonth(monthId: string): Promise<EnvelopeWithBalance[]> {
  const db = await getDatabase();

  const envelopes = await db.getAllAsync<Envelope>(
    'SELECT * FROM envelopes WHERE is_active = 1 ORDER BY sort_order ASC'
  );

  const monthlyEnvelopes = await db.getAllAsync<any>(
    'SELECT * FROM monthly_envelopes WHERE month_id = ?',
    [monthId]
  );

  const transactions = await db.getAllAsync<any>(
    'SELECT * FROM transactions WHERE month_id = ?',
    [monthId]
  );

  const result: EnvelopeWithBalance[] = [];

  for (const env of envelopes) {
    const monthlyData = monthlyEnvelopes.find(me => me.envelope_id === env.id) || {
      allocated_amount: 0,
      carry_over_amount: 0,
    };

    const allocated = monthlyData.allocated_amount || 0;
    const carryOver = monthlyData.carry_over_amount || 0;

    let spent = 0;
    let transfersIn = 0;
    let transfersOut = 0;

    for (const tx of transactions) {
      if (tx.type === 'EXPENSE' && tx.envelope_id === env.id) {
        spent += tx.amount || 0;
      } else if (tx.type === 'TRANSFER') {
        if (tx.envelope_id === env.id) {
          transfersOut += tx.amount || 0;
        }
        if (tx.to_envelope_id === env.id) {
          transfersIn += tx.amount || 0;
        }
      }
    }

    // Formula: Remaining = Allocated + CarryOver + TransfersIn - TransfersOut - Expenses
    const remaining = allocated + carryOver + transfersIn - transfersOut - spent;
    const totalAvailable = allocated + carryOver + transfersIn - transfersOut;

    let spentPercentage = 0;
    if (totalAvailable > 0) {
      spentPercentage = Math.min(Math.round((spent / totalAvailable) * 100), 100);
    } else if (spent > 0) {
      spentPercentage = 100;
    }

    result.push({
      ...env,
      allocated_amount: allocated,
      carry_over_amount: carryOver,
      spent_amount: spent,
      transfers_in: transfersIn,
      transfers_out: transfersOut,
      remaining_amount: remaining,
      spent_percentage: Math.max(spentPercentage, 0),
    });
  }

  return result;
}

/**
 * Create new custom envelope
 */
export async function createEnvelope(
  name: string,
  icon: string,
  color: string,
  carryOverEnabled = true
): Promise<string> {
  const db = await getDatabase();
  const id = `env_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const maxOrderRow = await db.getFirstAsync<any>(
    'SELECT MAX(sort_order) as max_order FROM envelopes'
  );
  const nextOrder = (maxOrderRow?.max_order || 0) + 1;

  await db.runAsync(
    `INSERT INTO envelopes (id, name, icon, color, sort_order, is_active, carry_over_enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    [id, name, icon, color, nextOrder, carryOverEnabled ? 1 : 0, now, now]
  );

  return id;
}

/**
 * Update existing envelope
 */
export async function updateEnvelope(
  id: string,
  name: string,
  icon: string,
  color: string,
  carryOverEnabled: boolean
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE envelopes SET name = ?, icon = ?, color = ?, carry_over_enabled = ?, updated_at = ?
     WHERE id = ?`,
    [name, icon, color, carryOverEnabled ? 1 : 0, now, id]
  );
}

/**
 * Archive envelope (Data safety requirement: do not permanently delete if transactions exist)
 */
export async function archiveEnvelope(id: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE envelopes SET is_active = 0, updated_at = ? WHERE id = ?`,
    [now, id]
  );
}

/**
 * Toggle carry over setting per envelope
 */
export async function toggleEnvelopeCarryOver(id: string, enabled: boolean): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE envelopes SET carry_over_enabled = ?, updated_at = ? WHERE id = ?`,
    [enabled ? 1 : 0, now, id]
  );
}
