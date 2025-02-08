import Decimal from "decimal.js";

export interface JournalEntry {
  accountId: string;
  type: string;
  amount: Decimal;
  description: string;
}
