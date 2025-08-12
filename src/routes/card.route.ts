import type { FastifyInstance } from 'fastify'

import { createCard, getCards } from '../controllers/card.controller'
import { checkUser } from '../middleware/index.middleware'

export default async function card(f: FastifyInstance) {
	f.route({
		method: 'POST',
		url: ':ownerId',
		schema: {
			body :{
				type: 'object',
				required: ['correctAnswer', 'difficulty', 'tags', 'topic', 'question'],
				additionalProperties: false,
				properties: {
					correctAnswer: { type: 'string', minLength: 2 },
					difficulty: { type: 'string', pattern: '^[a-zA-Z]+$' },
					tags: {
						type: 'array',
						items: { type: 'string', minLength: 2 },
						minItems: 1,
						maxItems: 5,
						uniqueItems: true
					},
					topic: { type: 'string', minLength: 2 },
					question: { type: 'string', minLength: 5 }
				}
			},
			params: {
				type: 'object',
				additionalProperties: false,
				required: ['ownerId'],
				properties: {
					ownerId: { type: 'string' }
				}
			},
			response: {
				201: {
					additionalProperties: false,
					type: 'object',
					required: ['data'],
					properties: {
						data: {
							type: 'object',
							additionalProperties: false,
							required: [
								'_id',
								'answeredCorrectlyAt',
								'answerHistory',
								'correctAnswer',
								'createdAt',
								'difficulty',
								'nextReviewAt',
								'normalizedQuestion',
								'tags',
								'topic',
								'question'
							],
							properties: {
								_id: { type: 'string' },
								answeredCorrectlyAt: {
									type: 'array',
									items: { type: 'string', format: 'date-time' }
								},
								answerHistory: {
									type: 'array',
									items: {
										type: 'object',
										additionalProperties: false,
										required: ['date', 'correct'],
										properties: {
											date: { type: 'string', format: 'date-time' },
											correct: { type: 'boolean' }
										}
									}
								},
								createdAt: { type: 'string', format: 'date-time' },
								correctAnswer: { type: 'string' },
								difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
								nextReviewAt: { type: 'string', format: 'date-time' },
								normalizedQuestion: { type: 'string' },
								tags: { type: 'array' },
								topic: { type: 'string' },
								question: { type: 'string' }
							}
						}
					}
				},
				500: { $ref: 'ErrorResponse#' }
			}
		},
		preHandler: [f.authenticate, checkUser],
		handler: createCard(f)
	})

	f.route({
		method: 'GET',
		url: ':ownerId',
		schema: {
			params: {
				type: 'object',
				additionalProperties: false,
				required: ['ownerId'],
				properties: {
					ownerId: { type: 'string' }
				}
			},
			response: {
				200: {
					type: 'object',
					additionalProperties: false,
					required: ['cached', 'data'],
					properties: {
						cached: { type: 'boolean' },
						data: {
							type: 'array',
							items: {
								type: 'object',
								additionalProperties: false,
								required: [
									'_id',
									'answeredCorrectlyAt',
									'answerHistory',
									'createdAt',
									'correctAnswer',
									'difficulty',
									'nextReviewAt',
									'normalizedQuestion',
									'tags',
									'topic',
									'question'
								],
								properties: {
									_id: { type: 'string' },
									answeredCorrectlyAt: {
										type: 'array',
										items: { type: 'string', format: 'date-time' }
									},
									answerHistory: {
										type: 'array',
										items: {
											type: 'object',
											additionalProperties: false,
											required: ['date', 'correct'],
											properties: {
												date: { type: 'string', format: 'date-time' },
												correct: { type: 'boolean' }
											}
										}
									},
									createdAt: { type: 'string', format: 'date-time' },
									correctAnswer: { type: 'string' },
									difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
									nextReviewAt: { type: 'string', format: 'date-time' },
									normalizedQuestion: { type: 'string' },
									tags: { type: 'array', items: { type: 'string' } },
									topic: { type: 'string' },
									question: { type: 'string' }
								}
							}
						}
					}
				},
				401: { $ref: 'ErrorResponse#' },
				500: { $ref: 'ErrorResponse#' }
			}
		},
		preHandler: [f.authenticate, checkUser],
		handler: getCards(f)
	})
}
