export interface MockBudget {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  month: string
  year: string
}

export const mockBudgets: MockBudget[] = [
  { id: 1, categoryId: 3, categoryName: 'Food', amount: 2000000, month: '02', year: '2026' },
  { id: 2, categoryId: 4, categoryName: 'Rent', amount: 4000000, month: '02', year: '2026' },
  { id: 3, categoryId: 5, categoryName: 'Transportation', amount: 500000, month: '02', year: '2026' },
  { id: 4, categoryId: 6, categoryName: 'Entertainment', amount: 500000, month: '02', year: '2026' },
]
