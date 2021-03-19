/**
 * Fields in a request to update a single Meal item.
 */
export interface UpdateMealRequest {
  name: string
  dueDate: string
  done: boolean
  recipe: string
}