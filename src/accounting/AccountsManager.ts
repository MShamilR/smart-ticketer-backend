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
import { db } from "db/setup";
import Decimal from "decimal.js";

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
    userId: number,
    payment: Payment,
    invoiceItems: InvoiceItem[]
  ): Promise<AccountsManagerResponse> {
    return await db.transaction(async (tx) => {
      const transaction: Transaction =
        await TransactionsManager.createTransaction(
          TRANSACTION_TYPES.TOPUP,
          tx
        );
      const userGLAccount = this.getUserGLAccountId(userId);

      // Moved to AccountsCalculation class for testing, not final.
      // const commisionRate = this.getIPGCommision(payment.type);

      const journalEntries: JournalEntry[] =
        AccountsCalculation.getCreditsPurchase(invoiceItems, payment.type);

      await this.insertJournalEntries(journalEntries, transaction, tx);

      return { transaction, journalEntries };
    });
  }

  public static async creditsConsume(
    userId: number,
    amount: Decimal
  ): Promise<AccountsManagerResponse> {
    return await db.transaction(async (tx) => {
      const transaction: Transaction =
        await TransactionsManager.createTransaction(
          TRANSACTION_TYPES.CONSUME,
          tx
        );

      const userGLAccountId = this.getUserGLAccountId(userId);
      const journalEntries: JournalEntry[] =
        AccountsCalculation.getCreditsConsume(userGLAccountId, amount);

      await this.insertJournalEntries(journalEntries, transaction, tx);

      return { transaction, journalEntries, tx };
    });
  }

  public static creditsTransfer() {}

  public static creditsRefund() {}

  public static async createUserAccount() {
    return await db.transaction(async (tx) => {
      const transaction: Transaction =
        await TransactionsManager.createTransaction(
          TRANSACTION_TYPES.CREATE,
          tx
        );
    });
  }

  private static async insertJournalEntries(
    journalEntries: JournalEntry[],
    transaction: Transaction,
    tx: any
  ) {
    await Promise.all(
      journalEntries.map((journalEntry) =>
        GLEntryCreator.createGLEntry(journalEntry, transaction, tx)
      )
    );
  }

  private static getUserGLAccountId(userId: number): string {
    return `L-U` + userId; // L=> LIABILITY U=> User
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
