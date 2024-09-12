import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../config/db'
import { goalCompletions, goals } from '../models'
import { AppError } from '../utils/AppError'
import { getEndOfWeek, getStartOfWeek } from '../utils/DateUtils'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  try {
    const firstDayOfWeek = getStartOfWeek()
    const lastDayOfWeek = getEndOfWeek()

    const goalsCompletionCounts = db.$with('goals_completion_counts').as(
      db
        .select({
          goalId: goalCompletions.goalId,
          completionCount: sql`COUNT(${goalCompletions.id})`.as(
            'completionCount'
          ),
        })
        .from(goalCompletions)
        .where(
          and(
            gte(goalCompletions.createdAt, firstDayOfWeek),
            lte(goalCompletions.createdAt, lastDayOfWeek),
            eq(goalCompletions.goalId, goalId)
          )
        )
        .groupBy(goalCompletions.goalId)
    )

    const result = await db
      .with(goalsCompletionCounts)
      .select({
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        completionCount: sql /*sql*/`
          COALESCE(${goalsCompletionCounts.completionCount}, 0)
        `.mapWith(Number),
      })
      .from(goals)
      .leftJoin(
        goalsCompletionCounts,
        eq(goals.id, goalsCompletionCounts.goalId)
      )
      .where(eq(goals.id, goalId))
      .limit(1)

    const { completionCount, desiredWeeklyFrequency } = result[0]

    if (completionCount >= desiredWeeklyFrequency) {
      throw new AppError('Goal already completed for this week', 400)
    }

    const insertResult = await db
      .insert(goalCompletions)
      .values({
        goalId,
      })
      .returning()

    const goalCompletion = insertResult[0]

    return goalCompletion
  } catch (error) {
    console.error('Erro ao executar a query:', error)
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError('Erro ao criar a conclusão da meta', 500)
  }
}
