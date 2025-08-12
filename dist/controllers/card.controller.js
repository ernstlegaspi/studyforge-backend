"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardById = exports.answerCard = exports.getCards = exports.createCard = void 0;
const card_model_1 = __importDefault(require("../models/card.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const utils_1 = require("../utils");
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
        await user_model_1.default.findByIdAndUpdate(ownerId, {
            $addToSet: {
                cards: newCard._id
            }
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
        return (0, utils_1._500)(rep);
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
        return (0, utils_1._500)(rep);
    }
};
exports.getCards = getCards;
const answerCard = (f) => async (req, rep) => {
    try {
        const { cardId, difficulty, isUserAnswerCorrect } = req.body;
        let nextReviewAt = new Date();
        switch (difficulty) {
            case 'easy':
                nextReviewAt = (0, utils_1.expires5Days)();
                break;
            case 'medium':
                nextReviewAt = (0, utils_1.expires3Days)();
                break;
            default:
                nextReviewAt = (0, utils_1.expires1Day)();
                break;
        }
        const card = await card_model_1.default.findByIdAndUpdate(cardId, {
            nextReviewAt: isUserAnswerCorrect ? nextReviewAt : new Date(),
            $push: {
                answeredCorrectlyAt: isUserAnswerCorrect ? new Date() : undefined,
                answerHistory: {
                    date: new Date(),
                    correct: isUserAnswerCorrect
                }
            }
        }, {
            new: true,
            runValidators: true
        }).select('-owner -updatedAt').lean();
        if (!card)
            return rep.code(404).send({ message: 'Card not found.' });
        await f.redis.del(getCardsKey);
        return rep.code(200).send({ data: card });
    }
    catch (e) {
        console.error(e);
        return (0, utils_1._500)(rep);
    }
};
exports.answerCard = answerCard;
const getCardById = (f) => async (req, rep) => {
    try {
        const { cardId } = req.params;
        if (!cardId)
            return rep.code(404).send({ message: 'Card not found.' });
        const key = `card:${cardId}`;
        const result = await f.redis.get(key);
        if (result)
            return rep.code(200).send({ cached: true, data: JSON.parse(result) });
        const card = await card_model_1.default.findById(cardId).select('-owner -updatedAt').lean();
        if (!card)
            return rep.code(404).send({ message: 'Card not found.' });
        await f.redis.set(key, JSON.stringify(card), 'EX', 120);
        return rep.code(200).send({ cached: false, data: card });
    }
    catch (e) {
        console.error(e);
        return (0, utils_1._500)(rep);
    }
};
exports.getCardById = getCardById;
// getCardById display info of that card
