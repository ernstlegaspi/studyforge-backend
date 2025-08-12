import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import Card from '../models/card.model'
import User from '../models/user.model'
import {
	_500,
	expires1Day,
	expires3Days,
	expires5Days
} from '../utils'

type Card = {
	correctAnswer: string
	difficulty: 'easy' | 'medium' | 'hard',
	tags: string[]
	topic: string
	question: string
}

type AnswerCard = {
	cardId: string
	difficulty: string
	isUserAnswerCorrect: boolean
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

		await User.findByIdAndUpdate(ownerId,
			{
				$addToSet: {
					cards: newCard._id
				}
			},
		)

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
		return _500(rep)
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
		return _500(rep)
	}
}

export const answerCard = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: AnswerCard, Params: { ownerId: string } }>, rep: FastifyReply) => {
	try {
		const {
			cardId,
			difficulty,
			isUserAnswerCorrect
		} = req.body

		let nextReviewAt = new Date()

		switch(difficulty) {
			case 'easy':
				nextReviewAt = expires5Days()
				break
			case 'medium':
				nextReviewAt = expires3Days()
				break
			default:
				nextReviewAt = expires1Day()
				break
		}

		const card = await Card.findByIdAndUpdate(cardId,
			{
				nextReviewAt: isUserAnswerCorrect ? nextReviewAt : new Date(),
				$push: {
					answeredCorrectlyAt: isUserAnswerCorrect ? new Date() : undefined,
					answerHistory: {
						date: new Date(),
						correct: isUserAnswerCorrect
					}
				}
			},
			{
				new: true,
				runValidators: true
			}
		).select('-owner -updatedAt').lean()

		if(!card) return rep.code(404).send({ message: 'Card not found.' })

		await f.redis.del(getCardsKey)

		return rep.code(200).send({ data: card })
	} catch(e) {
		console.error(e)
		return _500(rep)
	}
}

export const getCardById = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { cardId: string, ownerId: string } }>, rep: FastifyReply) => {
	try {
		const { cardId } = req.params

		if(!cardId) return rep.code(404).send({ message: 'Card not found.' })

		const key = `card:${cardId}`
		const result = await f.redis.get(key)

		if(result) return rep.code(200).send({ cached: true, data: JSON.parse(result) })

		const card = await Card.findById(cardId).select('-owner -updatedAt').lean()

		if(!card) return rep.code(404).send({ message: 'Card not found.' })

		await f.redis.set(
			key,
			JSON.stringify(card),
			'EX',
			120
		)

		return rep.code(200).send({ cached: false, data: card })
	} catch(e) {
		console.error(e)
		return _500(rep)
	}
}
