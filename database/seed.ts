import { getDatabase } from './database';
import { DEFAULT_ENVELOPES } from '../utils/icons';

export async function seedInitialDataIfNeeded(): Promise<boolean> {
  const db = await getDatabase();
  const existingEnvelopes = await db.getAllAsync('SELECT * FROM envelopes');

  if (existingEnvelopes.length === 0) {
    const now = new Date().toISOString();
    let order = 0;

    for (const env of DEFAULT_ENVELOPES) {
      await db.runAsync(
        `INSERT INTO envelopes (id, name, icon, color, sort_order, is_active, carry_over_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [env.id, env.name, env.icon, env.color, order++, now, now]
      );
    }
    return true; // Fresh seed created
  }

  return false; // Already seeded
}
