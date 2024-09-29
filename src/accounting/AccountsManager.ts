import { JournalEntry } from "./interfaces/JournalEntry";
import { integer } from "drizzle-orm/pg-core";
import { db } from "../db/setup";
import { response } from "express";
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
    invoice: Invoice,
    invoiceItems: InvoiceItem[]
  ): Promise<AccountsManagerResponse> {
    const transaction: Transaction =
      await TransactionsManager.createTransaction(
        TRANSACTION_TYPES.TOPUP,
        payment.type!,
        invoice.amountPayable
      );
    const userGLAccount = this.getUserGLAccount(user);

    // Moved to AccountsCalculation class for testing, not final.
    // const commisionRate = this.getIPGCommision(payment.type);

    const journalEntries: JournalEntry[] =
      AccountsCalculation.getCreditsPurchase(invoiceItems, payment.type);

    this.insertJournalEntries(journalEntries, transaction);

    return { transaction, journalEntries };
  }

  public static creditsConsume() {}

  public static creditsTransfer() {}

  public static creditsRefund() {}

  public static createUserAccount() {}

  private static insertJournalEntries(
    journalEntries: JournalEntry[],
    transaction: Transaction
  ) {
    journalEntries.forEach((journalEntry) => {
      GLEntryCreator.createGLEntry(journalEntry, transaction);
    });
  }

  private static getUserGLAccount(user: User): string {
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
