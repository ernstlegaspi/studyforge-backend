import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

import User from '../models/user.model'
import RefreshToken from '../models/refresh_token.model'
import { expires7Days } from '../utils'

const setCookie = (rep: FastifyReply, refreshToken: string) => rep.setCookie(
	'refresh_token',
	refreshToken,
	{
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/api/auth/refresh',
		maxAge: 60 * 60 * 24 * 7
	}
)

const tokenTime: string = '30m'

export const signUp = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: { email: string, name: string, password: string } }>, rep: FastifyReply) => {
	try {
		const { email, name, password } = req.body

		const user = await User.findOne({ email }).lean()

		if(user) return rep.code(409).send({ message: 'Email is already used.' })

		const hashedPassword = await bcrypt.hash(password, 10)
		const jti = randomUUID()

		const newUser = await User.create({
			email,
			password: hashedPassword,
			name
		})

		await RefreshToken.create({
			expiresAt: expires7Days(),
			jti,
			user: newUser._id
		})

		const sub = newUser._id.toString()

		const refreshToken = f.jwt.sign(
			{
				jti,
				sub
			},
			{ expiresIn: '7d' }
		)

		setCookie(rep, refreshToken)

		const token = f.jwt.sign({ sub }, { expiresIn: tokenTime })

		return rep.code(201).send({
			email,
			name,
			token
		})
	} catch(e) {
		console.error(e)
		return rep.code(500).send({ message: 'Something went wrong. Try again later.' })
	}
}

export const signIn = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: { email: string, password: string } }>, rep: FastifyReply) => {
	try {
		const { email, password } = req.body

		const user = await User.findOne({ email }).lean()

		if(!user) return rep.code(401).send({ message: 'Unauthorized.' })

		const ok = await bcrypt.compare(password, user.password)

		if(!ok) return rep.code(401).send({ message: 'Unauthorized.' })

		const jti = randomUUID()

		await RefreshToken.create({
			expiresAt: expires7Days(),
			jti,
			user: user._id
		})

		const sub = user._id.toString()

		const refreshToken = f.jwt.sign(
			{
				jti,
				sub
			},
			{ expiresIn: '7d' }
		)

		setCookie(rep, refreshToken)

		const token = f.jwt.sign({ sub }, { expiresIn: tokenTime })

		return rep.code(200).send({ email, name: user.name, token })
	} catch(e) {
		console.error(e)
		return rep.code(500).send({ message: 'Something went wrong. Try again later.' })
	}
}

export const refresh = (f: FastifyInstance) => async (req: FastifyRequest, rep: FastifyReply) => {
	try {
		const cookie = req.cookies.refresh_token

		if(!cookie) return rep.code(401).send({ message: 'Unauthorized.' })

		let { jti, sub } = f.jwt.verify<{ jti: string, sub: string }>(cookie)

		if(!jti || !sub) return rep.code(401).send({ message: 'Unauthorized.' })

		const oldRefreshToken = await RefreshToken.findOneAndUpdate(
			{
				jti,
				user: sub,
				revoked: { $ne: true }
			},
			{
				$set: {
					revoked: true,
					revokedAt: new Date()
				}
			},
			{ new: true }
		)

		if(!oldRefreshToken) return rep.code(401).send({ message: 'Unauthorized.' })

		const user = await User.findById(sub)

		if(!user) return rep.code(401).send({ message: 'Unauthorized.' })

		const newJti = randomUUID()

		await RefreshToken.create({
			jti: newJti,
			user: sub,
			expiresAt: expires7Days()
		})

		const newRefreshToken = f.jwt.sign(
			{
				jti: newJti,
				sub
			},
			{ expiresIn: '7d' }
		)

		setCookie(rep, newRefreshToken)

		const token = f.jwt.sign({ sub }, { expiresIn: tokenTime })

		return rep.code(200).send({
			email: user.email,
			name: user.name,
			token
		})
	} catch(e) {
		console.error(e)
		console.error("REFRESH ERROR")
		return rep.code(500).send({ message: 'Something went wrong. Try again later.' })
	}
}
