import { getDatabase } from '../database/database';
import { getTodayIsoDate } from '../utils/dates';
import { paiseToRupees } from '../utils/currency';

export interface BackupData {
  backup_version: number;
  exported_at: string;
  envelopes: any[];
  months: any[];
  monthly_envelopes: any[];
  income: any[];
  recurring_income: any[];
  transactions: any[];
  settings: any[];
}

/**
 * Generates JSON backup structure of entire database.
 */
export async function exportBackupJSON(): Promise<{ fileName: string; jsonContent: string }> {
  const db = await getDatabase();

  const envelopes = await db.getAllAsync('SELECT * FROM envelopes');
  const months = await db.getAllAsync('SELECT * FROM months');
  const monthly_envelopes = await db.getAllAsync('SELECT * FROM monthly_envelopes');
  const income = await db.getAllAsync('SELECT * FROM income');
  const recurring_income = await db.getAllAsync('SELECT * FROM recurring_income');
  const transactions = await db.getAllAsync('SELECT * FROM transactions');
  const settings = await db.getAllAsync('SELECT * FROM settings');

  const backupData: BackupData = {
    backup_version: 1,
    exported_at: new Date().toISOString(),
    envelopes,
    months,
    monthly_envelopes,
    income,
    recurring_income,
    transactions,
    settings,
  };

  const todayStr = getTodayIsoDate();
  const fileName = `envelope-budget-backup-${todayStr}.json`;
  const jsonContent = JSON.stringify(backupData, null, 2);

  return { fileName, jsonContent };
}

/**
 * Validates and restores JSON backup into database.
 */
export async function importBackupJSON(jsonString: string): Promise<boolean> {
  let data: BackupData;

  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON backup file structure.');
  }

  if (!data || data.backup_version !== 1) {
    throw new Error('Unsupported or invalid backup version.');
  }

  const db = await getDatabase();

  // Wipe current data inside transaction/sequence
  await db.runAsync('DELETE FROM transactions');
  await db.runAsync('DELETE FROM monthly_envelopes');
  await db.runAsync('DELETE FROM income');
  await db.runAsync('DELETE FROM recurring_income');
  await db.runAsync('DELETE FROM envelopes');
  await db.runAsync('DELETE FROM months');
  await db.runAsync('DELETE FROM settings');

  // Restore months
  if (Array.isArray(data.months)) {
    for (const item of data.months) {
      await db.runAsync(
        'INSERT INTO months (id, year, month, created_at) VALUES (?, ?, ?, ?)',
        [item.id, item.year, item.month, item.created_at]
      );
    }
  }

  // Restore envelopes
  if (Array.isArray(data.envelopes)) {
    for (const item of data.envelopes) {
      await db.runAsync(
        `INSERT INTO envelopes (id, name, icon, color, sort_order, is_active, carry_over_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.name,
          item.icon,
          item.color,
          item.sort_order,
          item.is_active,
          item.carry_over_enabled,
          item.created_at,
          item.updated_at,
        ]
      );
    }
  }

  // Restore monthly_envelopes
  if (Array.isArray(data.monthly_envelopes)) {
    for (const item of data.monthly_envelopes) {
      await db.runAsync(
        `INSERT INTO monthly_envelopes (id, month_id, envelope_id, allocated_amount, carry_over_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.month_id,
          item.envelope_id,
          item.allocated_amount,
          item.carry_over_amount,
          item.created_at,
          item.updated_at,
        ]
      );
    }
  }

  // Restore income
  if (Array.isArray(data.income)) {
    for (const item of data.income) {
      await db.runAsync(
        `INSERT INTO income (id, month_id, amount, source, date, notes, recurring_income_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.month_id,
          item.amount,
          item.source,
          item.date,
          item.notes,
          item.recurring_income_id,
          item.created_at,
        ]
      );
    }
  }

  // Restore recurring income
  if (Array.isArray(data.recurring_income)) {
    for (const item of data.recurring_income) {
      await db.runAsync(
        `INSERT INTO recurring_income (id, source, amount, day_of_month, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.source,
          item.amount,
          item.day_of_month,
          item.is_active,
          item.created_at,
          item.updated_at,
        ]
      );
    }
  }

  // Restore transactions
  if (Array.isArray(data.transactions)) {
    for (const item of data.transactions) {
      await db.runAsync(
        `INSERT INTO transactions (id, month_id, type, amount, envelope_id, to_envelope_id, description, date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.month_id,
          item.type,
          item.amount,
          item.envelope_id,
          item.to_envelope_id,
          item.description,
          item.date,
          item.notes,
          item.created_at,
          item.updated_at,
        ]
      );
    }
  }

  return true;
}

/**
 * Generates CSV string for all transactions.
 */
export async function exportTransactionsCSV(): Promise<{ fileName: string; csvContent: string }> {
  const db = await getDatabase();
  const txs = await db.getAllAsync('SELECT * FROM transactions ORDER BY date DESC');
  const envelopes = await db.getAllAsync('SELECT id, name FROM envelopes');
  const envMap = new Map(envelopes.map((e: any) => [e.id, e.name]));

  let csv = 'Date,Type,Envelope,Description,Amount (INR),Notes\n';

  for (const t of txs) {
    const envName = envMap.get(t.envelope_id) || (t.type === 'INCOME' ? 'Income' : '');
    const amountINR = paiseToRupees(t.amount);
    const notesStr = (t.notes || '').replace(/"/g, '""');

    csv += `"${t.date}","${t.type}","${envName}","${t.description}","${amountINR}","${notesStr}"\n`;
  }

  const fileName = `envelope-budget-transactions-${getTodayIsoDate()}.csv`;
  return { fileName, csvContent: csv };
}
