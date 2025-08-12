"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const progressSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Progress', progressSchema);
