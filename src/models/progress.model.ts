import { model, Schema } from 'mongoose'

const progressSchema = new Schema({
	totalCardsReviewed: {
		type: Number,
		default: 0,
		min: 0
	},
	cardsReviewedYesterday: {
		type: Number,
		default: 0,
		min: 0
	},
	cardsReviewedToday: {
		type: Number,
		default: 0,
		min: 0
	},
	cardsReviewedLastWeek: {
		type: Number,
		default: 0,
		min: 0
	},
	cardsReviewedThisWeek: {
		type: Number,
		default: 0,
		min: 0
	},
	cardsReviewedThisMonth: {
		type: Number,
		default: 0,
		min: 0
	},
	cardsReviewedLastMonth: {
		type: Number,
		default: 0,
		min: 0
	},
	streak: {
		type: Number,
		default: 0,
		min: 0
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, { timestamps: true })

export default model('Progress', progressSchema)
