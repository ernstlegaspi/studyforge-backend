import { model, Schema } from 'mongoose'

const cardSchema = new Schema({
	answeredCorrectlyAt: [Date],
	answerHistory: [{ date: Date, correct: Boolean }],
	correctAnswer: {
		type: String,
		required: true,
		trim: true
	},
	difficulty: {
		type: String,
		required: true,
		trim: true,
		enum: ['easy', 'medium', 'hard']
	},
	nextReviewAt: {
		type: Date,
		default: Date.now
	},
	normalizedQuestion: {
		type: String,
		trim: true,
		required: true
	},
	tags: [String],
	topic: String,
	question: {
		type: String,
		required: true,
		trim: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, { timestamps: true })

cardSchema.index({ owner: 1, normalizedQuestion: 1 }, { unique: true })

export default model('Card', cardSchema)
