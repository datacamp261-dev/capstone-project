export interface Meal {
  mealId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
  recipe: string
}
