export const keys = {
  categories: ['categories'],

  transactions: {
    all: ['transactions'],
    list: (filters) => ['transactions', 'list', filters],
    recent: ['transactions', 'recent'],
  },

  summary: (month) => ['summary', month],
  summaryAll: ['summary'],

  budgets: (month) => ['budgets', month],
  budgetsAll: ['budgets'],

  budgetStatus: (month) => ['budget-status', month],
  budgetStatusAll: ['budget-status'],
}