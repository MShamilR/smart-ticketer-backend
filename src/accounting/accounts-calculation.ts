import { invoiceItems } from "../db/schema/invoiceItems";
import { GL_ACCOUNTS } from "./constants/gl-accounts";
import { JournalEntry } from "./interfaces/journal-entry";
import { pymtTypes } from "../db/schema/payments";
import Decimal from "decimal.js";

type InvoiceItem = typeof invoiceItems.$inferInsert;
type PaymentType = (typeof pymtTypes)[number];

export default class AccountsCalculation {
  private static DEBIT = "DEBIT";
  private static CREDIT = "CREDIT";

  private static topupAmount = new Decimal(0);
  private static processingFee = new Decimal(0);
  private static totalAmount = new Decimal(0);

  private static entries: JournalEntry[] = [];

  public static getCreditsPurchase(
    invoiceItems: InvoiceItem[],
    type: PaymentType
  ): JournalEntry[] {
    // Reset state
    this.entries = [];
    this.topupAmount = new Decimal(0);
    this.processingFee = new Decimal(0);
    this.totalAmount = new Decimal(0);

    this.calculateCharges(invoiceItems, type);

    this.addJournalEntry(
      GL_ACCOUNTS.USER_CREDITS,
      "DEBIT",
      this.topupAmount,
      "Credit Topup for User"
    );

    this.addJournalEntry(
      GL_ACCOUNTS.CASH,
      "CREDIT",
      this.totalAmount,
      "Cash received from user"
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
    amount: Decimal
  ): JournalEntry[] {
    // Reset state
    this.entries = [];
    this.topupAmount = new Decimal(0);
    this.processingFee = new Decimal(0);
    this.totalAmount = new Decimal(0);

    this.addJournalEntry(
      GL_ACCOUNTS.USER_CREDITS,
      "CREDIT",
      amount,
      "Credit Consume By User" // Todo: Add User Id
    );

    this.addJournalEntry(
      userGLAccountId,
      "DEBIT",
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
      const amount = new Decimal(item.amount!);
      const type = item.type;
      this.setCharges(amount, type!);
      this.updateTotalAmount(amount, type!);
    });
    const commisionRate = this.getIPGCommision(type);
    this.processingFee = this.totalAmount.times(commisionRate);
  }

  private static updateTotalAmount(amount: Decimal, type: string): void {
    switch (type) {
      case "PURCHASE_ITEM":
      case "CHARGE":
        this.totalAmount = this.totalAmount.add(amount);
        break;
      case "ADDON":
        this.totalAmount = this.totalAmount.minus(amount);
        break;
      default:
        break;
    }
  }

  private static setCharges(amount: Decimal, type: string): void {
    switch (type) {
      case "PURCHASE_ITEM":
        this.topupAmount = this.topupAmount.add(amount);
        break;
      default:
        break;
    }
  }

  private static getIPGCommision(paymentType: PaymentType): Decimal {
    switch (paymentType) {
      case "PAYHERE":
        return new Decimal(process.env.COMMISSION_PAYHERE!);
        break;
      default:
        return new Decimal(0);
    }
  }

  private static addJournalEntry(
    accountId: string,
    type: string,
    amount: Decimal,
    description: string
  ) {
    const entry: JournalEntry = { accountId, type, amount, description };
    this.entries.push(entry);
  }
}
