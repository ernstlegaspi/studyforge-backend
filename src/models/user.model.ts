import { model, Schema } from 'mongoose'

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
	},
	password: {
		type: String,
		required: true
	},
	cards: [{
		type: Schema.Types.ObjectId,
		ref: 'Card'
	}],
	notes: [{
		type: Schema.Types.ObjectId,
		ref: 'Note'
	}],
	progress: {
		type: Schema.Types.ObjectId,
		ref: 'Progress'
	}
}, { timestamps: true })

export default model('User', userSchema)
