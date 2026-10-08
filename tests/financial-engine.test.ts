import { parseINRToPaise, formatINR, validateAllocation } from '../utils/currency';
import { resetMemoryDbForTesting, getDatabase } from '../database/database';
import { seedInitialDataIfNeeded } from '../database/seed';
import { addIncome, saveAllocationsForMonth, getMonthSummary, saveRecurringIncome } from '../services/income-service';
import { getEnvelopesForMonth, toggleEnvelopeCarryOver } from '../services/envelope-service';
import { addExpense, addTransfer, deleteTransaction, getTransactionsForMonth } from '../services/transaction-service';
import { ensureMonthExists } from '../services/month-service';
import { exportBackupJSON, importBackupJSON } from '../services/backup-service';

describe('Envelope Budget Financial Engine Test Suite', () => {
  beforeEach(async () => {
    resetMemoryDbForTesting();
    await seedInitialDataIfNeeded();
  });

  test('1. Integer Paise Parsing and Indian Formatting', () => {
    expect(parseINRToPaise('₹20,000')).toBe(2000000);
    expect(parseINRToPaise('800.50')).toBe(80050);
    expect(parseINRToPaise(100)).toBe(10000);

    expect(formatINR(2000000)).toBe('₹20,000');
    expect(formatINR(80050)).toBe('₹800.50');
    expect(formatINR(-20000)).toBe('-₹200');
  });

  test('2. Income Addition and Unallocated Money Calculation', async () => {
    const monthId = '2026-10';
    await ensureMonthExists(monthId);

    // Add Income ₹20,000
    await addIncome(monthId, 2000000, 'Salary', '2026-10-01', 'Monthly Salary');

    // Allocation: Household ₹4,000, Food ₹3,000
    await saveAllocationsForMonth(monthId, {
      household: 400000,
      food: 300000,
    });

    const summary = await getMonthSummary(monthId);
    expect(summary.totalIncomePaise).toBe(2000000); // ₹20,000
    expect(summary.totalAllocatedPaise).toBe(700000); // ₹7,000
    expect(summary.unallocatedPaise).toBe(1300000); // ₹13,000
  });

  test('3. Expense Deduction and Multiple Expenses Balance Calculation', async () => {
    const monthId = '2026-10';
    await ensureMonthExists(monthId);
    await saveAllocationsForMonth(monthId, { household: 400000 }); // ₹4,000

    // Add Rice expense ₹800
    await addExpense(monthId, 80000, 'household', 'Rice', '2026-10-07');

    let envs = await getEnvelopesForMonth(monthId);
    let household = envs.find(e => e.id === 'household')!;
    expect(household.remaining_amount).toBe(320000); // ₹3,200 remaining

    // Add Cooking Oil ₹300, Detergent ₹250
    await addExpense(monthId, 30000, 'household', 'Cooking Oil', '2026-10-07');
    await addExpense(monthId, 25000, 'household', 'Detergent', '2026-10-05');

    envs = await getEnvelopesForMonth(monthId);
    household = envs.find(e => e.id === 'household')!;
    expect(household.spent_amount).toBe(135000); // ₹1,350 total spent
    expect(household.remaining_amount).toBe(265000); // ₹2,650 remaining
  });

  test('4. Transfer Between Envelopes', async () => {
    const monthId = '2026-10';
    await ensureMonthExists(monthId);
    await saveAllocationsForMonth(monthId, { household: 400000, food: 300000 });

    // Transfer ₹500 from Household to Food
    await addTransfer(monthId, 50000, 'household', 'food', '2026-10-08');

    const envs = await getEnvelopesForMonth(monthId);
    const household = envs.find(e => e.id === 'household')!;
    const food = envs.find(e => e.id === 'food')!;

    expect(household.transfers_out).toBe(50000);
    expect(household.remaining_amount).toBe(350000); // ₹3,500

    expect(food.transfers_in).toBe(50000);
    expect(food.remaining_amount).toBe(350000); // ₹3,500
  });

  test('5. Delete Expense Restores Envelope Balance', async () => {
    const monthId = '2026-10';
    await ensureMonthExists(monthId);
    await saveAllocationsForMonth(monthId, { household: 400000 });

    const txId = await addExpense(monthId, 80000, 'household', 'Rice', '2026-10-07');
    let envs = await getEnvelopesForMonth(monthId);
    expect(envs.find(e => e.id === 'household')!.remaining_amount).toBe(320000);

    // Delete transaction
    await deleteTransaction(txId);
    envs = await getEnvelopesForMonth(monthId);
    expect(envs.find(e => e.id === 'household')!.remaining_amount).toBe(400000); // Restored!
  });

  test('6. Overspending Allows Negative Balance', async () => {
    const monthId = '2026-10';
    await ensureMonthExists(monthId);
    await saveAllocationsForMonth(monthId, { household: 30000 }); // ₹300 allocated

    // Expense ₹500 (overspending by ₹200)
    await addExpense(monthId, 50000, 'household', 'Big Appliance', '2026-10-07');

    const envs = await getEnvelopesForMonth(monthId);
    const household = envs.find(e => e.id === 'household')!;
    expect(household.remaining_amount).toBe(-20000); // -₹200 overspent
  });

  test('7. Month Transition & Carry-Over Logic', async () => {
    const oct = '2026-10';
    await ensureMonthExists(oct);
    await saveAllocationsForMonth(oct, { household: 400000, food: 300000 });

    // Household spent ₹1,400 -> remaining ₹2,600
    await addExpense(oct, 140000, 'household', 'Rice', '2026-10-07');

    // Food spent ₹3,000 -> remaining ₹0
    await addExpense(oct, 300000, 'food', 'Groceries', '2026-10-07');

    // Enable carry-over for household, disable for food
    await toggleEnvelopeCarryOver('household', true);
    await toggleEnvelopeCarryOver('food', false);

    // Transition to November
    const nov = '2026-11';
    await ensureMonthExists(nov);

    const novEnvs = await getEnvelopesForMonth(nov);
    const novHousehold = novEnvs.find(e => e.id === 'household')!;
    const novFood = novEnvs.find(e => e.id === 'food')!;

    // Household carry-over ON: New allocation ₹4,000 + Carry-over ₹2,600 = ₹6,600 available
    expect(novHousehold.carry_over_amount).toBe(260000);
    expect(novHousehold.remaining_amount).toBe(660000);

    // Food carry-over OFF: Carry-over = ₹0
    expect(novFood.carry_over_amount).toBe(0);
    expect(novFood.remaining_amount).toBe(300000);

    // Verify October remains unchanged
    const octEnvs = await getEnvelopesForMonth(oct);
    expect(octEnvs.find(e => e.id === 'household')!.remaining_amount).toBe(260000);
  });

  test('8. Recurring Salary Does Not Duplicate', async () => {
    await saveRecurringIncome('Salary', 2000000, 1);

    const oct = '2026-10';
    await ensureMonthExists(oct);
    await ensureMonthExists(oct); // Re-opened multiple times in same month

    const txs = await getTransactionsForMonth(oct);
    const db = await getDatabase();
    const incomes = await db.getAllAsync('SELECT * FROM income WHERE month_id = ?', [oct]);

    expect(incomes.length).toBe(1); // Salary generated exactly ONCE!
  });

  test('9. Backup Export and Restore Verification', async () => {
    const oct = '2026-10';
    await ensureMonthExists(oct);
    await addIncome(oct, 2000000, 'Salary', '2026-10-01');
    await saveAllocationsForMonth(oct, { household: 400000 });
    await addExpense(oct, 80000, 'household', 'Rice', '2026-10-07');

    const { jsonContent } = await exportBackupJSON();
    expect(jsonContent).toContain('"backup_version": 1');

    // Clear memory database
    resetMemoryDbForTesting();
    const emptyEnvs = await getEnvelopesForMonth(oct);
    expect(emptyEnvs.length).toBe(0);

    // Restore from backup
    await importBackupJSON(jsonContent);

    const restoredEnvs = await getEnvelopesForMonth(oct);
    const household = restoredEnvs.find(e => e.id === 'household')!;
    expect(household).toBeDefined();
    expect(household.spent_amount).toBe(80000);
    expect(household.remaining_amount).toBe(320000);
  });
});
