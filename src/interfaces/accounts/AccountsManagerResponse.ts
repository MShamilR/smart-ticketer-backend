import { transactions } from "../../db/schema/transactions";
import { glAccounts } from "../../db/schema/glAccounts";
import { JournalEntry } from "./JournalEntry";

type GLAccount = typeof glAccounts.$inferInsert;
type Transaction = typeof transactions.$inferInsert;

export interface AccountsManagerResponse {
  glAccount: GLAccount;
  transaction: Transaction;
  journalEntries: JournalEntry[];
}
