import { Decimal } from "decimal.js";
import { glAccounts } from "../db/schema/glAccounts";
import { JournalEntry } from "./interfaces/JournalEntry";
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
    transaction: Transaction,
    tx: any
  ) {
    const glAccount = await tx.query.glAccounts.findFirst({
      where: eq(glAccounts.id, journalEntry.accountId),
    });
    const newStanding = this.calculateStanding(glAccount!, journalEntry);
    await this.updateGLAccount(glAccount!, newStanding, tx);
    await this.saveGLEntry(journalEntry, transaction, newStanding, tx);
  }

  private static calculateStanding(
    glAccount: GLAccount,
    journalEntry: JournalEntry
  ): Decimal {
    const accountType = glAccount.type;
    const balance = new Decimal(glAccount.balance);

    const entryType = journalEntry.type;
    const amount = journalEntry.amount;

    if (accountType === this.LIABILITY || accountType === this.INCOME) {
      if (entryType === this.DEBIT) {
        return balance.minus(amount)
      } else {
        return balance.plus(amount);
      }
    } else {
      if (entryType === this.DEBIT) {
        return balance.plus(amount)
      } else {
        return balance.minus(amount);
      }
    }
  }

  public static async updateGLAccount(
    glAccount: GLAccount,
    newStanding: Decimal,
    tx: any
  ) {
    await tx
      .update(glAccounts)
      .set({ balance: newStanding })
      .where(eq(glAccounts.id, glAccount.id));
  }

  public static async saveGLEntry(
    journalEntry: JournalEntry,
    transaction: Transaction,
    standing: Decimal,
    tx: any
  ) {
    const newGLEntry: GLEntry = {
      description: journalEntry.description,
      type: journalEntry.type,
      glAccountId: journalEntry.accountId,
      amount: journalEntry.amount.toString(),
      transactionId: transaction.id!,
      standing: standing.toString(),
    };

    await tx.insert(glEntries).values(newGLEntry);
  }
}
