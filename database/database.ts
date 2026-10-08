import { CREATE_TABLES_SQL } from './schema';
import * as SQLite from 'expo-sqlite';

export interface DatabaseDriver {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
}

class MemoryDb implements DatabaseDriver {
  public tables: {
    months: any[];
    envelopes: any[];
    monthly_envelopes: any[];
    income: any[];
    recurring_income: any[];
    transactions: any[];
    settings: any[];
  } = {
    months: [],
    envelopes: [],
    monthly_envelopes: [],
    income: [],
    recurring_income: [],
    transactions: [],
    settings: [],
  };

  private isLoaded = false;

  async initPersistence() {
    if (this.isLoaded) return;
    this.isLoaded = true;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('envelope_budget_db_tables');
        if (saved) {
          this.tables = JSON.parse(saved);
          return;
        }
      }
    } catch (e) {}

    try {
      const FileSystem = require('expo-file-system');
      if (FileSystem && FileSystem.documentDirectory) {
        const fileUri = FileSystem.documentDirectory + 'envelope_budget_db_tables.json';
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo && fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(fileUri);
          if (content) {
            this.tables = JSON.parse(content);
          }
        }
      }
    } catch (e) {}
  }

  async saveToDisk() {
    const dataStr = JSON.stringify(this.tables);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('envelope_budget_db_tables', dataStr);
      }
    } catch (e) {}

    try {
      const FileSystem = require('expo-file-system');
      if (FileSystem && FileSystem.documentDirectory) {
        const fileUri = FileSystem.documentDirectory + 'envelope_budget_db_tables.json';
        await FileSystem.writeAsStringAsync(fileUri, dataStr);
      }
    } catch (e) {}
  }

  async execAsync(sql: string): Promise<void> {
    await this.initPersistence();
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    await this.initPersistence();
    const qUpper = sql.trim().replace(/\s+/g, ' ').toUpperCase();
    let res = { lastInsertRowId: 1, changes: 1 };

    // 1. MONTHS
    if (qUpper.startsWith('INSERT INTO MONTHS')) {
      const [id, year, month, created_at] = params;
      this.tables.months = this.tables.months.filter(m => m.id !== id);
      this.tables.months.push({ id, year: Number(year), month: Number(month), created_at });
      res = { lastInsertRowId: this.tables.months.length, changes: 1 };
    }

    // 2. ENVELOPES
    else if (qUpper.startsWith('INSERT INTO ENVELOPES')) {
      let id, name, icon, color, sort_order, is_active, carry_over_enabled, created_at, updated_at;
      if (params.length === 7) {
        [id, name, icon, color, sort_order, created_at, updated_at] = params;
        is_active = 1;
        carry_over_enabled = 1;
      } else {
        [id, name, icon, color, sort_order, is_active, carry_over_enabled, created_at, updated_at] = params;
      }
      this.tables.envelopes = this.tables.envelopes.filter(e => e.id !== id);
      this.tables.envelopes.push({
        id,
        name,
        icon,
        color,
        sort_order: Number(sort_order),
        is_active: Number(is_active),
        carry_over_enabled: Number(carry_over_enabled),
        created_at,
        updated_at,
      });
      res = { lastInsertRowId: this.tables.envelopes.length, changes: 1 };
    }

    else if (qUpper.startsWith('UPDATE ENVELOPES SET NAME =')) {
      const [name, icon, color, carry_over_enabled, updated_at, id] = params;
      const item = this.tables.envelopes.find(e => e.id === id);
      if (item) {
        item.name = name; item.icon = icon; item.color = color; item.carry_over_enabled = Number(carry_over_enabled); item.updated_at = updated_at;
      }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    else if (qUpper.startsWith('UPDATE ENVELOPES SET IS_ACTIVE =')) {
      const [updated_at, id] = params;
      const item = this.tables.envelopes.find(e => e.id === id);
      if (item) { item.is_active = 0; item.updated_at = updated_at; }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    else if (qUpper.startsWith('UPDATE ENVELOPES SET CARRY_OVER_ENABLED =')) {
      const [carry_over_enabled, updated_at, id] = params;
      const item = this.tables.envelopes.find(e => e.id === id);
      if (item) { item.carry_over_enabled = Number(carry_over_enabled); item.updated_at = updated_at; }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    // 3. MONTHLY_ENVELOPES
    else if (qUpper.startsWith('INSERT INTO MONTHLY_ENVELOPES')) {
      const [id, month_id, envelope_id, allocated_amount, carry_over_amount, created_at, updated_at] = params;
      this.tables.monthly_envelopes = this.tables.monthly_envelopes.filter(
        me => !(me.month_id === month_id && me.envelope_id === envelope_id)
      );
      this.tables.monthly_envelopes.push({
        id,
        month_id,
        envelope_id,
        allocated_amount: Number(allocated_amount),
        carry_over_amount: Number(carry_over_amount),
        created_at,
        updated_at,
      });
      res = { lastInsertRowId: this.tables.monthly_envelopes.length, changes: 1 };
    }

    else if (qUpper.startsWith('UPDATE MONTHLY_ENVELOPES SET ALLOCATED_AMOUNT =')) {
      const [allocated_amount, updated_at, id] = params;
      const item = this.tables.monthly_envelopes.find(me => me.id === id);
      if (item) {
        item.allocated_amount = Number(allocated_amount);
        item.updated_at = updated_at;
      }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    // 4. INCOME
    else if (qUpper.startsWith('INSERT INTO INCOME')) {
      const [id, month_id, amount, source, date, notes, recurring_income_id, created_at] = params;
      this.tables.income.push({
        id,
        month_id,
        amount: Number(amount),
        source,
        date,
        notes,
        recurring_income_id,
        created_at,
      });
      res = { lastInsertRowId: this.tables.income.length, changes: 1 };
    }

    // 5. RECURRING_INCOME
    else if (qUpper.startsWith('INSERT INTO RECURRING_INCOME')) {
      const [id, source, amount, day_of_month, is_active, created_at, updated_at] = params;
      this.tables.recurring_income.push({
        id,
        source,
        amount: Number(amount),
        day_of_month: Number(day_of_month),
        is_active: Number(is_active),
        created_at,
        updated_at,
      });
      res = { lastInsertRowId: this.tables.recurring_income.length, changes: 1 };
    }

    else if (qUpper.startsWith('UPDATE RECURRING_INCOME')) {
      const [source, amount, day_of_month, updated_at, id] = params;
      const item = this.tables.recurring_income.find(r => r.id === id);
      if (item) {
        item.source = source;
        item.amount = Number(amount);
        item.day_of_month = Number(day_of_month);
        item.updated_at = updated_at;
      }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    // 6. TRANSACTIONS
    else if (qUpper.startsWith('INSERT INTO TRANSACTIONS')) {
      const [id, month_id, type, amount, envelope_id, to_envelope_id, description, date, notes, created_at, updated_at] = params;
      this.tables.transactions.push({
        id,
        month_id,
        type,
        amount: Number(amount),
        envelope_id,
        to_envelope_id,
        description,
        date,
        notes,
        created_at,
        updated_at,
      });
      res = { lastInsertRowId: this.tables.transactions.length, changes: 1 };
    }

    else if (qUpper.startsWith('DELETE FROM TRANSACTIONS WHERE ID =')) {
      const [id] = params;
      this.tables.transactions = this.tables.transactions.filter(t => t.id !== id);
      res = { lastInsertRowId: 0, changes: 1 };
    }

    // 7. SETTINGS
    else if (qUpper.startsWith('INSERT INTO SETTINGS')) {
      const [key, value] = params;
      this.tables.settings = this.tables.settings.filter(s => s.key !== key);
      this.tables.settings.push({ key, value });
      res = { lastInsertRowId: this.tables.settings.length, changes: 1 };
    }

    else if (qUpper.startsWith('UPDATE SETTINGS')) {
      const [value, key] = params;
      const item = this.tables.settings.find(s => s.key === key);
      if (item) { item.value = value; }
      else { this.tables.settings.push({ key, value }); }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    // 8. GLOBAL DELETES
    else if (qUpper.startsWith('DELETE FROM')) {
      const parts = qUpper.split(' ');
      const tableName = parts[2]?.toLowerCase();
      if (tableName && (this.tables as any)[tableName]) {
        (this.tables as any)[tableName] = [];
      }
      res = { lastInsertRowId: 0, changes: 1 };
    }

    await this.saveToDisk();
    return res;
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.initPersistence();
    const qUpper = sql.trim().replace(/\s+/g, ' ').toUpperCase();

    if (qUpper.includes('FROM MONTHS')) {
      if (qUpper.includes('WHERE ID =')) {
        return this.tables.months.filter(m => m.id === params[0]) as any;
      }
      return [...this.tables.months] as any;
    }

    if (qUpper.includes('FROM ENVELOPES')) {
      if (qUpper.includes('WHERE IS_ACTIVE = 1')) {
        return this.tables.envelopes
          .filter(e => e.is_active === 1)
          .sort((a, b) => a.sort_order - b.sort_order) as any;
      }
      if (qUpper.includes('WHERE ID =')) {
        return this.tables.envelopes.filter(e => e.id === params[0]) as any;
      }
      return [...this.tables.envelopes].sort((a, b) => a.sort_order - b.sort_order) as any;
    }

    if (qUpper.includes('FROM MONTHLY_ENVELOPES')) {
      if (qUpper.includes('WHERE MONTH_ID =') && qUpper.includes('AND ENVELOPE_ID =')) {
        return this.tables.monthly_envelopes.filter(
          me => me.month_id === params[0] && me.envelope_id === params[1]
        ) as any;
      }
      if (qUpper.includes('WHERE MONTH_ID =')) {
        return this.tables.monthly_envelopes.filter(me => me.month_id === params[0]) as any;
      }
      return [...this.tables.monthly_envelopes] as any;
    }

    if (qUpper.includes('FROM INCOME')) {
      if (qUpper.includes('WHERE MONTH_ID =') && qUpper.includes('AND RECURRING_INCOME_ID =')) {
        return this.tables.income.filter(
          i => i.month_id === params[0] && i.recurring_income_id === params[1]
        ) as any;
      }
      if (qUpper.includes('WHERE MONTH_ID =')) {
        return this.tables.income.filter(i => i.month_id === params[0]) as any;
      }
      return [...this.tables.income] as any;
    }

    if (qUpper.includes('FROM RECURRING_INCOME')) {
      return this.tables.recurring_income.filter(r => r.is_active === 1) as any;
    }

    if (qUpper.includes('FROM TRANSACTIONS')) {
      let list = [...this.tables.transactions];
      if (qUpper.includes('WHERE MONTH_ID =')) {
        list = list.filter(t => t.month_id === params[0]);
      }
      return list as any;
    }

    if (qUpper.includes('FROM SETTINGS')) {
      if (qUpper.includes('WHERE KEY =')) {
        return this.tables.settings.filter(s => s.key === params[0]) as any;
      }
      return [...this.tables.settings] as any;
    }

    return [];
  }

  async getFirstAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  clearAll() {
    this.tables = {
      months: [],
      envelopes: [],
      monthly_envelopes: [],
      income: [],
      recurring_income: [],
      transactions: [],
      settings: [],
    };
    this.saveToDisk();
  }
}

let dbInstance: DatabaseDriver | null = null;
const memoryDbSingleton = new MemoryDb();

export async function getDatabase(): Promise<DatabaseDriver> {
  if (dbInstance) return dbInstance;

  try {
    if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
      const nativeDb = SQLite.openDatabaseSync('envelope_budget.db');
      await nativeDb.execAsync(CREATE_TABLES_SQL);
      dbInstance = nativeDb as any as DatabaseDriver;
      return nativeDb as any as DatabaseDriver;
    }
  } catch (e) {
    console.warn('Native SQLite unavailable, using persistent memory DB:', e);
  }

  await memoryDbSingleton.initPersistence();
  dbInstance = memoryDbSingleton;
  return memoryDbSingleton;
}

export function resetMemoryDbForTesting() {
  memoryDbSingleton.clearAll();
  dbInstance = memoryDbSingleton;
}
