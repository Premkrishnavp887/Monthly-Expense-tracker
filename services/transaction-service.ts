import { getDatabase } from '../database/database';

export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface Transaction {
  id: string;
  month_id: string;
  type: TransactionType;
  amount: number; // in paise
  envelope_id?: string;
  to_envelope_id?: string;
  description: string;
  date: string; // ISO format YYYY-MM-DD
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields for display
  envelope_name?: string;
  envelope_icon?: string;
  to_envelope_name?: string;
}

export interface TransactionFilters {
  type?: TransactionType | 'ALL';
  envelopeId?: string;
  searchQuery?: string;
}

/**
 * Add expense transaction
 */
export async function addExpense(
  monthId: string,
  amountPaise: number,
  envelopeId: string,
  description: string,
  date: string,
  notes?: string
): Promise<string> {
  const db = await getDatabase();
  const id = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO transactions (id, month_id, type, amount, envelope_id, to_envelope_id, description, date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, monthId, 'EXPENSE', amountPaise, envelopeId, null, description, date, notes || null, now, now]
  );

  return id;
}

/**
 * Add transfer transaction between two envelopes
 */
export async function addTransfer(
  monthId: string,
  amountPaise: number,
  fromEnvelopeId: string,
  toEnvelopeId: string,
  date: string,
  notes?: string
): Promise<string> {
  const db = await getDatabase();
  const id = `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const fromEnv = await db.getFirstAsync<any>('SELECT name FROM envelopes WHERE id = ?', [fromEnvelopeId]);
  const toEnv = await db.getFirstAsync<any>('SELECT name FROM envelopes WHERE id = ?', [toEnvelopeId]);
  const desc = `Transfer from ${fromEnv?.name || 'Envelope'} to ${toEnv?.name || 'Envelope'}`;

  await db.runAsync(
    `INSERT INTO transactions (id, month_id, type, amount, envelope_id, to_envelope_id, description, date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, monthId, 'TRANSFER', amountPaise, fromEnvelopeId, toEnvelopeId, desc, date, notes || null, now, now]
  );

  return id;
}

/**
 * Get filtered transactions for a month
 */
export async function getTransactionsForMonth(
  monthId: string,
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  const db = await getDatabase();

  const transactions = await db.getAllAsync<any>(
    'SELECT * FROM transactions WHERE month_id = ? ORDER BY date DESC, created_at DESC',
    [monthId]
  );

  const envelopes = await db.getAllAsync<any>('SELECT * FROM envelopes');
  const envMap = new Map(envelopes.map(e => [e.id, e]));

  const result: Transaction[] = [];

  for (const tx of transactions) {
    // Type Filter
    if (filters.type && filters.type !== 'ALL' && tx.type !== filters.type) {
      continue;
    }

    // Envelope Filter
    if (filters.envelopeId) {
      if (tx.envelope_id !== filters.envelopeId && tx.to_envelope_id !== filters.envelopeId) {
        continue;
      }
    }

    // Search Query Filter
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchNotes = tx.notes?.toLowerCase().includes(q);
      const envName = envMap.get(tx.envelope_id)?.name?.toLowerCase() || '';
      const matchEnv = envName.includes(q);

      if (!matchDesc && !matchNotes && !matchEnv) {
        continue;
      }
    }

    const fromEnv = envMap.get(tx.envelope_id);
    const toEnv = envMap.get(tx.to_envelope_id);

    result.push({
      ...tx,
      envelope_name: fromEnv?.name || (tx.type === 'INCOME' ? 'Income' : ''),
      envelope_icon: fromEnv?.icon || (tx.type === 'INCOME' ? '💰' : '💳'),
      to_envelope_name: toEnv?.name || '',
    });
  }

  return result;
}

/**
 * Deletes a transaction (Restores envelope balances automatically)
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
}
