import type { FastifyReply } from 'fastify'

export const expires1Day = () => new Date(Date.now() + 24 * 60 * 60 * 1000)
export const expires3Days = () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
export const expires5Days = () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

// for token
export const expires7Days = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

// status codes

export const _500 = (rep: FastifyReply) => rep.code(500).send({ message: 'Something went wrong. Try again later.' })
