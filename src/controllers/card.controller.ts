import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import Card from '../models/card.model'

type Card = {
	correctAnswer: string
	difficulty: 'easy' | 'medium' | 'hard',
	tags: string[]
	topic: string
	question: string
}

const getCardsKey = 'cards:all'

export const createCard = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: Card, Params: { ownerId: string } }>, rep: FastifyReply) => {
	try {
		const { correctAnswer, difficulty, tags, topic, question } = req.body
		const ownerId = req.params.ownerId

		const normalizedQuestion = question.toLowerCase().trim()

		const existingCard = await Card.findOne({
			normalizedQuestion,
			owner: ownerId
		}).select('_id').lean()

		if(existingCard) return rep.code(400).send({ message: 'Card with that question is already existing.' })

		const newCard = await Card.create({
			correctAnswer,
			difficulty,
			normalizedQuestion,
			tags,
			topic,
			question,
			owner: ownerId
		})

		await f.redis.del(getCardsKey)

		const { owner, _id, ...rest } = newCard.toObject()

		return rep.code(201).send({
			data: {
				_id: _id.toString(),
				...rest
			}
		})
	} catch(e) {
		console.error(e)
		return rep.code(500).send({ message: 'Something went wrong. Try again later.' })
	}
}

export const getCards = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { ownerId: string } }>, rep: FastifyReply) => {
	try {
		const owner = req.params.ownerId

		const result = await f.redis.get(getCardsKey)

		if(result) return rep.code(200).send({ cached: true, data: JSON.parse(result) })

		const cards = await Card.find({ owner, nextReviewAt: { $lt: new Date() } }).select('-owner -updatedAt').lean()

		await f.redis.set(
			getCardsKey,
			JSON.stringify(cards),
			'EX',
			120
		)

		return rep.code(200).send({ cached: false, data: cards })
	} catch(e) {
		console.error(e)
		return rep.code(500).send({ message: 'Something went wrong. Try again later.' })
	}
}

// getCardById display info of that card
// answer card
