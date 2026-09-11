// utils/date.ts

/**
 * Calculates the due date for an invoice without external libs
 * @param days - Number of days for payment terms (e.g. 15, 30, 60)
 * @param issueDate - Issue date (defaults to today)
 * @param formatted - Return as formatted string if true (default false returns Date)
 */
export function calculateDueDate(
  days: number,
  issueDate: Date = new Date(),
  formatted: boolean = false
): string | Date {
  const dueDate = new Date(issueDate) // clone da data
  dueDate.setDate(dueDate.getDate() + days) // adiciona os dias

  if (formatted) {
    // yyyy-mm-dd
    const year = dueDate.getFullYear()
    const month = String(dueDate.getMonth() + 1).padStart(2, "0")
    const day = String(dueDate.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return dueDate
}
