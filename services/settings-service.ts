import { getDatabase } from '../database/database';

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<any>('SELECT key FROM settings WHERE key = ?', [key]);

  if (existing) {
    await db.runAsync('UPDATE settings SET value = ? WHERE key = ?', [value, key]);
  } else {
    await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
}

export async function isPinLockEnabled(): Promise<boolean> {
  const val = await getSetting('pin_lock_enabled', 'false');
  return val === 'true';
}

export async function setPinCode(pin: string): Promise<void> {
  await setSetting('pin_code', pin);
  await setSetting('pin_lock_enabled', 'true');
}

export async function disablePinCode(): Promise<void> {
  await setSetting('pin_lock_enabled', 'false');
  await setSetting('pin_code', '');
}

export async function verifyPinCode(pin: string): Promise<boolean> {
  const storedPin = await getSetting('pin_code', '');
  return storedPin === pin;
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const val = await getSetting('onboarding_completed', 'false');
  return val === 'true';
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await setSetting('onboarding_completed', completed ? 'true' : 'false');
}
