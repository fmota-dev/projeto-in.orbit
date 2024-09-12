import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../../env'
import { schema } from '../../models'

export const client = postgres(env.DATABASE_URL)
export const db = drizzle(client, { schema, logger: true })
