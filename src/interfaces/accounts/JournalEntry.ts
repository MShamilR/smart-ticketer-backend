export interface JournalEntry {
    accountId: string,
    type: string,
    amount: bigint,
    description: string
}