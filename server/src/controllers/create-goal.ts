import { db } from '../config/db'
import { goals } from '../models'
import { AppError } from '../utils/AppError'

interface CreateGoalRequest {
  title: string
  desiredWeeklyFrequency: number
}

export async function createGoal({
  title,
  desiredWeeklyFrequency,
}: CreateGoalRequest) {
  try {
    const result = await db
      .insert(goals)
      .values({
        title,
        desiredWeeklyFrequency,
      })
      .returning()

    const goal = result[0]

    return {
      goal,
    }
  } catch (error) {
    console.error('Erro ao criar a meta:', error)
    throw new AppError('Erro ao criar a meta', 500)
  }
}
