import { invoiceItems } from "./../db/schema/invoiceItems";
import { GL_ACCOUNTS } from "./constants/gl-accounts";
import { JournalEntry } from "./interfaces/JournalEntry";
import { pymtTypes } from "../db/schema/payments";

type InvoiceItem = typeof invoiceItems.$inferInsert;
type PaymentType = (typeof pymtTypes)[number];

export default class AccountsCalculation {
  private static DEBIT = "DEBIT";
  private static CREDIT = "CREDIT";

  private static topupAmount = BigInt(0);
  private static processingFee = BigInt(0);
  private static totalAmount = BigInt(0);

  private static entries: JournalEntry[];

  public static getCreditsPurchase(
    invoiceItems: InvoiceItem[],
    type: PaymentType
  ): JournalEntry[] {
    this.calculateCharges(invoiceItems, type);

    this.addJournalEntry(
      GL_ACCOUNTS.USER_CREDITS,
      "DEBIT",
      this.topupAmount,
      "Credit Topup for User"
    );

    this.addJournalEntry(
      GL_ACCOUNTS.USER_CREDITS,
      "CREDIT",
      this.processingFee,
      "Processing fee payable"
    );

    return this.entries;
  }

  private static calculateCharges(
    invoiceItems: InvoiceItem[],
    type: PaymentType
  ) {
    invoiceItems.forEach((item) => {
      const subject = item.subject;
      const amount = item.amount!;
      const type = item.type;
      this.setCharges(amount, type!);
      this.updateTotalAmount(amount, type!);
    });
    const commisionRate = this.getIPGCommision(type);
    this.processingFee = this.totalAmount * commisionRate;
  }

  private static updateTotalAmount(amount: bigint, type: string): void {
    switch (type) {
      case "PURCHASE_ITEM":
      case "CHARGE":
        this.totalAmount += amount;
        break;
      case "ADDON":
        this.totalAmount + -amount;
        break;
      default:
        break;
    }
  }

  private static setCharges(amount: bigint, type: string): void {
    switch (type) {
      case "PURCHASE_ITEM":
        this.topupAmount += amount;
        break;
      default:
        break;
    }
  }

  private static getIPGCommision(paymentType: PaymentType): bigint {
    switch (paymentType) {
      case "PAYHERE":
        return BigInt(process.env.COMMISSION_PAYHERE!);
        break;
      default:
        return BigInt(0);
    }
  }

  private static addJournalEntry(
    accountId: string,
    type: string,
    amount: bigint,
    description: string
  ) {
    const entry: JournalEntry = { accountId, type, amount, description };
    this.entries.push(entry);
  }
}
