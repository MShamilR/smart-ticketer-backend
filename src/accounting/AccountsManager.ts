import { db } from "../db/setup";
import { response } from "express";
import TransactionsManager from "./TransactionsManager";
import { transactions } from "../db/schema/transactions";
import { invoiceItems } from "../db/schema/invoiceItems";
import { invoices } from "../db/schema/invoices";
import {
  TRANSACTION_TYPES,
} from "../db/schema/transactions";
import { payments, pymtTypes } from "../db/schema/payments";

type Transaction = typeof transactions.$inferInsert;
type Payment = typeof payments.$inferInsert;
type Invoice = typeof invoices.$inferInsert;
type InvoiceItem = typeof invoiceItems.$inferInsert;

type PaymentType = (typeof pymtTypes)[number];

// Flow -->

// Payment

// Transactions are always successful [It is a log of all financial events]

// Create a list of Journal Entries out of each invoice item pertaining to the invoice [Managed by class AccountssCalculation]

// Update GL Account and record GL Entry for each Journal Entry created above [Managed by class GLEntryCreator]

export default class AccountsManager {
  private static PURCHASE = "PURCHASE";
  private static CONSUME = "CONSUME";
  private static LIABILITY = "LIABILITY";

  public static async creditsPurchase(
    payment: Payment,
    invoice: Invoice,
    invoiceItems: InvoiceItem[]
  ) {
    const transaction: Transaction =
      await TransactionsManager.createTransaction(
        invoice.purchaseId,
        invoice.id!,
        TRANSACTION_TYPES.TOPUP,
        payment.type!,
        invoice.amountPayable
      );
  }

  public static creditsConsume() {}

  public static creditsTransfer() {}

  public static creditsRefund() {}
}
