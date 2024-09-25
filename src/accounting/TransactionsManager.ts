import { db } from "../db/setup";
import { transactions } from "../db/schema/transactions";
import {
  TRANSACTION_TYPES,
} from "../db/schema/transactions";

type Transaction = typeof transactions.$inferInsert;
type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
// type TransactionStatus =
//   (typeof TRANSACTION_STATUSES)[keyof typeof TRANSACTION_STATUSES];

export default class TransactionsManager {
  public static async createTransaction(
    purchaseId: number,
    invoiceId: number,
    type: TransactionType,
    paymentMethod: string,
    amount: bigint,
  ): Promise<Transaction> {
    const newTransaction: Omit<Transaction, "id" | "timestamp"> = {
      amount,
      type,
      paymentMethod,
    };

    const [response] = await db
      .insert(transactions)
      .values(newTransaction)
      .returning();

    return response;
  }
}
