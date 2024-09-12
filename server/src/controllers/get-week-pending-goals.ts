import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../config/db'
import { goalCompletions, goals } from '../models'
import { AppError } from '../utils/AppError'
import { getEndOfWeek, getStartOfWeek } from '../utils/DateUtils'

export async function getWeekPendingGoals() {
  try {
    const firstDayOfWeek = getStartOfWeek()
    const lastDayOfWeek = getEndOfWeek()

    const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
      db
        .select({
          id: goals.id,
          title: goals.title,
          desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
          createdAt: goals.createdAt,
        })
        .from(goals)
        .where(lte(goals.createdAt, lastDayOfWeek))
    )

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
            lte(goalCompletions.createdAt, lastDayOfWeek)
          )
        )
        .groupBy(goalCompletions.goalId)
    )

    const pendingGoals = await db
      .with(goalsCreatedUpToWeek, goalsCompletionCounts)
      .select({
        id: goalsCreatedUpToWeek.id,
        title: goalsCreatedUpToWeek.title,
        desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
        completionCount: sql /*sql*/`
          COALESCE(${goalsCompletionCounts.completionCount}, 0)
        `.mapWith(Number),
      })
      .from(goalsCreatedUpToWeek)
      .leftJoin(
        goalsCompletionCounts,
        eq(goalsCreatedUpToWeek.id, goalsCompletionCounts.goalId)
      )

    return {
      pendingGoals,
    }
  } catch (error) {
    console.error('Erro ao obter metas pendentes da semana:', error)
    throw new AppError('Erro ao obter metas pendentes da semana', 500)
  }
}
