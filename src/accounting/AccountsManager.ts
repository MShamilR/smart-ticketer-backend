import { JournalEntry } from "./interfaces/JournalEntry";
import TransactionsManager from "./TransactionsManager";
import AccountsCalculation from "./AccountsCalculation";
import GLEntryCreator from "./GLEntryCreator";
import { transactions } from "../db/schema/transactions";
import { invoiceItems } from "../db/schema/invoiceItems";
import { invoices } from "../db/schema/invoices";
import { users } from "../db/schema/users";
import { TRANSACTION_TYPES } from "../db/schema/transactions";
import { payments, pymtTypes } from "../db/schema/payments";
import "dotenv/config";
import { AccountsManagerResponse } from "./interfaces/AccountsManagerResponse";

type User = typeof users.$inferInsert;
type Transaction = typeof transactions.$inferInsert;
type Payment = typeof payments.$inferInsert;
type Invoice = typeof invoices.$inferInsert;
type InvoiceItem = typeof invoiceItems.$inferInsert;

type PaymentType = (typeof pymtTypes)[number];

export default class AccountsManager {
  private static PURCHASE = "PURCHASE";
  private static CONSUME = "CONSUME";
  private static LIABILITY = "LIABILITY";

  public static async creditsPurchase(
    user: User,
    payment: Payment,
    invoiceItems: InvoiceItem[]
  ): Promise<AccountsManagerResponse> {
    const transaction: Transaction =
      await TransactionsManager.createTransaction(TRANSACTION_TYPES.TOPUP);
    const userGLAccount = this.getUserGLAccountId(user);

    // Moved to AccountsCalculation class for testing, not final.
    // const commisionRate = this.getIPGCommision(payment.type);

    const journalEntries: JournalEntry[] =
      AccountsCalculation.getCreditsPurchase(invoiceItems, payment.type);

    await this.insertJournalEntries(journalEntries, transaction);

    return { transaction, journalEntries };
  }

  public static async creditsConsume(
    user: User,
    amount: bigint
  ): Promise<AccountsManagerResponse> {
    
    const transaction: Transaction =
      await TransactionsManager.createTransaction(TRANSACTION_TYPES.CONSUME);
    
    const userGLAccountId = this.getUserGLAccountId(user);
    const journalEntries: JournalEntry[] =
      AccountsCalculation.getCreditsConsume(userGLAccountId, amount);
    await this.insertJournalEntries(journalEntries, transaction);

    return { transaction, journalEntries };
  }

  public static creditsTransfer() {}

  public static creditsRefund() {}

  public static createUserAccount() {}

  private static async insertJournalEntries(
    journalEntries: JournalEntry[],
    transaction: Transaction
  ) {
    await Promise.all(
      journalEntries.map((journalEntry) =>
        GLEntryCreator.createGLEntry(journalEntry, transaction)
      )
    );
  }

  private static getUserGLAccountId(user: User): string {
    return `L-U` + user.id; // L=> LIABILITY U=> User
  }

  // private static getIPGCommision(paymentType: PaymentType): number {
  //   switch (paymentType) {
  //     case "PAYHERE":
  //       return parseInt(process.env.COMMISSION_PAYHERE!);
  //       break;

  //     default:
  //       return 0;
  //   }
  // }
}
