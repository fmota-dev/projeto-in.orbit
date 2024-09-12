import { createCompletionRoute } from './create-completion'
import { createGoalRoute } from './create-goal'
import { getPendingGoalsRoute } from './get-pending-goals'
import { getWeekSummaryRoute } from './get-week-summary'

export const routes = [
  createCompletionRoute,
  createGoalRoute,
  getPendingGoalsRoute,
  getWeekSummaryRoute,
]
