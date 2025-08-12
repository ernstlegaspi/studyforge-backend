"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Card'
        }],
    notes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Note'
        }],
    progress: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Progress'
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', userSchema);
