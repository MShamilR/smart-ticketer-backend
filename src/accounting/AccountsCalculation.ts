import { invoiceItems } from "./../db/schema/invoiceItems";
import { GL_ACCOUNTS } from "./constants/gl-accounts";
import { JournalEntry } from "./interfaces/JournalEntry";
import { pymtTypes } from "../db/schema/payments";

type InvoiceItem = typeof invoiceItems.$inferInsert;
type PaymentType = (typeof pymtTypes)[number];

export default class AccountsCalculation {
  private static DEBIT = "DEBIT";
  private static CREDIT = "CREDIT";

  private static topupAmount = Number(0);
  private static processingFee = Number(0);
  private static totalAmount = Number(0);

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
      GL_ACCOUNTS.PROCESSING_FEE,
      "CREDIT",
      this.processingFee,
      "Processing fee payable"
    );

    return this.entries;
  }

  public static getCreditsConsume(
    userGLAccountId: string,
    amount: number
  ): JournalEntry[] {
    this.addJournalEntry(
      GL_ACCOUNTS.USER_CREDITS,
      "DEBIT",
      amount,
      "Credit Consume By User" // Todo: Add User Id
    );

    this.addJournalEntry(
      userGLAccountId,
      "CREDIT",
      amount,
      "Credit Consume" // Todo: Add Trip Id
    );

    return this.entries;
  }

  private static calculateCharges(
    invoiceItems: InvoiceItem[],
    type: PaymentType
  ) {
    invoiceItems.forEach((item) => {
      const subject = item.subject;
      const amount = Number(item.amount!);
      const type = item.type;
      this.setCharges(amount, type!);
      this.updateTotalAmount(amount, type!);
    });
    const commisionRate = this.getIPGCommision(type);
    this.processingFee = this.totalAmount * commisionRate;
  }

  private static updateTotalAmount(amount: number, type: string): void {
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

  private static setCharges(amount: number, type: string): void {
    switch (type) {
      case "PURCHASE_ITEM":
        this.topupAmount += amount;
        break;
      default:
        break;
    }
  }

  private static getIPGCommision(paymentType: PaymentType): number {
    switch (paymentType) {
      case "PAYHERE":
        return Number(process.env.COMMISSION_PAYHERE!);
        break;
      default:
        return Number(0);
    }
  }

  private static addJournalEntry(
    accountId: string,
    type: string,
    amount: number,
    description: string
  ) {
    const entry: JournalEntry = { accountId, type, amount, description };
    this.entries.push(entry);
  }
}
