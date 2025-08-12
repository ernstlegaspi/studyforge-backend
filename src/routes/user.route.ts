import type { FastifyInstance } from 'fastify'

import { refresh, signIn, signUp } from '../controllers/user.controller'

export default async function user(f: FastifyInstance) {
	f.route({
		method: 'POST',
		url: 'sign-up',
		schema: {
			body: {
				type: 'object',
				required: ['email', 'name', 'password'],
				additionalProperties: false,
				properties: {
					email: {
						type: 'string',
						format: 'email',
						minLength: 5,
						maxLength: 60,
						pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
					},
					name: { type: 'string', minLength: 2 },
					password: { type: 'string', minLength: 8 }
				}
			},
			response: {
				201: {
					type: 'object',
					properties: {
						email: { type: 'string' },
						name: { type: 'string' },
						token: { type: 'string' }
					}
				},
				400: { $ref: 'ErrorResponse#' },
				401: { $ref: 'ErrorResponse#' },
				404: { $ref: 'ErrorResponse#' },
				409: { $ref: 'ErrorResponse#' },
				500: { $ref: 'ErrorResponse#' }
			}
		},
		handler: signUp(f)
	})

	f.route({
		method: 'POST',
		url: 'sign-in',
		schema: {
			body: {
				type: 'object',
				required: ['email', 'password'],
				additionalProperties: false,
				properties: {
					email: { type: 'string', format: 'email', minLength: 5 },
					password: { type: 'string', minLength: 8 }
				}
			},
			response: {
				200: {
					type: 'object',
					properties: {
						email: { type: 'string' },
						name: { type: 'string' },
						token: { type: 'string' }
					}
				},
				401: { $ref: 'ErrorResponse#' },
				500: { $ref: 'ErrorResponse#' }
			}
		},
		handler: signIn(f)
	})

	f.route({
		method: 'GET',
		url: 'refresh',
		schema: {
			response: {
				200: {
					type: 'object',
					properties: {
						email: { type: 'string' },
						name: { type: 'string' },
						token: { type: 'string' },
					}
				},
				401: { $ref: 'ErrorResponse#' },
				500: { $ref: 'ErrorResponse#' }
			}
		},
		handler: refresh(f)
	})
}
