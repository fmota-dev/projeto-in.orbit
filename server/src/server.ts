import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import fastifyCors from '@fastify/cors'
import { routes } from './routes'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

async function registerRoutes() {
  for (const route of routes) {
    await app.register(route)
  }
}

registerRoutes()
  .then(() => {
    app
      .listen({
        port: 3333,
      })
      .then(() => {
        console.log('Servidor HTTP iniciado com sucesso!')
      })
      .catch((err) => {
        console.error('Erro ao iniciar o servidor:', err)
        process.exit(1)
      })
  })
  .catch((err) => {
    console.error('Erro ao registrar rotas:', err)
    process.exit(1)
  })
