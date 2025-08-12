"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cardSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
cardSchema.index({ owner: 1, normalizedQuestion: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)('Card', cardSchema);
