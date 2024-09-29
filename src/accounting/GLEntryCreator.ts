import { glAccounts } from "../db/schema/glAccounts";
import { JournalEntry } from "./interfaces/JournalEntry";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";
import { transactions } from "../db/schema/transactions";
import { glEntries } from "../db/schema/glEntries";

type GLAccount = typeof glAccounts.$inferSelect;
type Transaction = typeof transactions.$inferInsert;
type GLEntry = typeof glEntries.$inferInsert;

export default class GLEntryCreator {
  private static DEBIT = "DEBIT";
  private static CREDIT = "CREDIT";
  private static LIABILITY = "LIABILIY";
  private static INCOME = "INCOME";

  public static async createGLEntry(
    journalEntry: JournalEntry,
    transaction: Transaction
  ) {
    const glAccount = await db.query.glAccounts.findFirst({
      where: eq(glAccounts.id, journalEntry.accountId),
    });
    const newStanding = this.calculateStanding(glAccount!, journalEntry);
    await this.updateGLAccount(glAccount!, newStanding);
    await this.saveGLEntry(journalEntry, transaction, newStanding);
  }

  private static calculateStanding(
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

  public static async updateGLAccount(
    glAccount: GLAccount,
    newStanding: bigint
  ) {
    await db
      .update(glAccounts)
      .set({ balance: newStanding })
      .where(eq(glAccounts.id, glAccount.id));
  }

  public static async saveGLEntry(
    journalEntry: JournalEntry,
    transaction: Transaction,
    standing: bigint
  ) {
    const newGLEntry: GLEntry = {
      description: journalEntry.description,
      type: journalEntry.type,
      glAccountId: journalEntry.accountId,
      amount: journalEntry.amount,
      transactionId: transaction.id!,
      standing,
    };

    await db.insert(glEntries).values(newGLEntry);
  }
}
