import { glAccounts } from "../db/schema/glAccounts";
import { JournalEntry } from "../interfaces/accounts/JournalEntry";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";
import { transactions } from "../db/schema/transactions";

type GLAccount = typeof glAccounts.$inferInsert;
type Transaction = typeof transactions.$inferInsert;

export default class GLEntryCreator {
  private static DEBIT = "DEBIT";
  private static CREDIT = "CREDIT";
  private static LIABILITY = "LIABILIY";
  private static INCOME = "INCOME";

  public static async createGLEntry(journalEntry: JournalEntry) {
    const glaccount = await db.query.glAccounts.findFirst({
      where: eq(glAccounts.id, journalEntry.accountId),
    });
  }

  public static calculateStanding(
    glAccount: GLAccount,
    journalEntry: JournalEntry
  ): bigint {
    const accountType = glAccount.type;
    const balance = glAccount.balance;

    const entryType = journalEntry.type;
    const amount = journalEntry.amount;

    if (accountType === this.LIABILITY || accountType === this.INCOME) {
      if (entryType === this.DEBIT) {
        return balance - amount;
      } else {
        return balance + amount;
      }
    } else {
      if (entryType === this.DEBIT) {
        return balance + amount;
      } else {
        return balance - amount;
      }
    }
  }

  public static async saveGLEntry(
    glAccount: GLAccount,
    journalEntry: JournalEntry,
    transaction: Transaction,
    standing: bigint
  ) {}

  public static async updateGLAccount() {}
}
