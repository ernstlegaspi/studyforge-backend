import { model, Schema } from 'mongoose'

const noteSchema = new Schema({ 
	title: {
		type: String,
		required: true,
		trim: true
	},
	content: {
		type: String,
		trim: true,
		required: true
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, { timestamps: true })

export default model('Note', noteSchema)
