"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCards = exports.createCard = void 0;
const card_model_1 = __importDefault(require("../models/card.model"));
const getCardsKey = 'cards:all';
const createCard = (f) => async (req, rep) => {
    try {
        const { correctAnswer, difficulty, tags, topic, question } = req.body;
        const ownerId = req.params.ownerId;
        const normalizedQuestion = question.toLowerCase().trim();
        const existingCard = await card_model_1.default.findOne({
            normalizedQuestion,
            owner: ownerId
        }).select('_id').lean();
        if (existingCard)
            return rep.code(400).send({ message: 'Card with that question is already existing.' });
        const newCard = await card_model_1.default.create({
            correctAnswer,
            difficulty,
            normalizedQuestion,
            tags,
            topic,
            question,
            owner: ownerId
        });
        await f.redis.del(getCardsKey);
        const { owner, _id, ...rest } = newCard.toObject();
        return rep.code(201).send({
            data: {
                _id: _id.toString(),
                ...rest
            }
        });
    }
    catch (e) {
        console.error(e);
        return rep.code(500).send({ message: 'Something went wrong. Try again later.' });
    }
};
exports.createCard = createCard;
const getCards = (f) => async (req, rep) => {
    try {
        const owner = req.params.ownerId;
        const result = await f.redis.get(getCardsKey);
        if (result)
            return rep.code(200).send({ cached: true, data: JSON.parse(result) });
        const cards = await card_model_1.default.find({ owner, nextReviewAt: { $lt: new Date() } }).select('-owner -updatedAt').lean();
        await f.redis.set(getCardsKey, JSON.stringify(cards), 'EX', 120);
        return rep.code(200).send({ cached: false, data: cards });
    }
    catch (e) {
        console.error(e);
        return rep.code(500).send({ message: 'Something went wrong. Try again later.' });
    }
};
exports.getCards = getCards;
