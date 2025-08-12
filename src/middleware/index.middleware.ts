import type { FastifyRequest, FastifyReply } from 'fastify'

export const checkUser = async (req: FastifyRequest<{ Params: { ownerId: string } }>, rep: FastifyReply) => {
	try {
			const { sub } = req.user as { sub: string }

			if(!sub || sub !== req.params.ownerId) return rep.code(403).send({ message: 'Forbidden.' })
	} catch(e) {
		console.error(e)
		return rep.code(500).send({ message: 'Internal server error.' })
	}
}