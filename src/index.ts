import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import Fastify from 'fastify'
import mongoose from 'mongoose'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

import cardRoutes from './routes/card.route'
import userRoutes from './routes/user.route'
import jwtPlugin from './plugins/jwt'
import redisPlugin from './plugins/redis'

(async () => {
	dotenv.config()

	const app = Fastify({
		ajv: {
			customOptions: {
				coerceTypes: false,
				allErrors: true
			}
		},
		logger: true
	})

	app.register(swagger, {
		openapi: {
			info: {
				title: 'My API',
				description: 'API documentation',
				version: '1.0.0'
			}
		}
	});

	app.register(swaggerUI, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'full',
			deepLinking: false
		}
	});

	app.register(jwtPlugin)
	app.register(redisPlugin)

	app.register(cookie, {
		secret: process.env.COOKIE_SECRET!,
		hook: 'onRequest'
	})

	app.register(cors, {
		credentials: true,
		origin: '*'
	})

	app.addSchema({
		$id: 'ErrorResponse',
		type: 'object',
		required: ['message'],
		properties: { message: { type: 'string' } }
	})

	// all routes goes below this line

	app.register(cardRoutes, { prefix: '/api/card/' })
	app.register(userRoutes, { prefix: '/api/auth/' })

	try {
		const port = process.env.PORT || 3000

		await mongoose.connect(process.env.DATABASE_URI!)
		await app.listen({ port: Number(port) })

		console.log(`Server is running in PORT: ${port}`)
	} catch(e) {
		app.log.error(e)
	}
})()
