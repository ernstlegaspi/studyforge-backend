"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.refresh = exports.signIn = exports.signUp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
const user_model_1 = __importDefault(require("../models/user.model"));
const refresh_token_model_1 = __importDefault(require("../models/refresh_token.model"));
const utils_1 = require("../utils");
const setCookie = (rep, refreshToken) => rep.setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth/refresh',
    maxAge: 60 * 60 * 24 * 7
});
const tokenTime = '30m';
const signUp = (f) => async (req, rep) => {
    try {
        const { email, name, password } = req.body;
        const user = await user_model_1.default.findOne({ email }).lean();
        if (user)
            return rep.code(409).send({ message: 'Email is already used.' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const jti = (0, crypto_1.randomUUID)();
        const newUser = await user_model_1.default.create({
            email,
            password: hashedPassword,
            name
        });
        await refresh_token_model_1.default.create({
            expiresAt: (0, utils_1.expires7Days)(),
            jti,
            user: newUser._id
        });
        const sub = newUser._id.toString();
        const refreshToken = f.jwt.sign({
            jti,
            sub
        }, { expiresIn: '7d' });
        setCookie(rep, refreshToken);
        const token = f.jwt.sign({ sub }, { expiresIn: tokenTime });
        return rep.code(201).send({
            email,
            name,
            token
        });
    }
    catch (e) {
        console.error(e);
        return rep.code(500).send({ message: 'Something went wrong. Try again later.' });
    }
};
exports.signUp = signUp;
const signIn = (f) => async (req, rep) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email }).lean();
        if (!user)
            return rep.code(401).send({ message: 'Unauthorized.' });
        const ok = await bcryptjs_1.default.compare(password, user.password);
        if (!ok)
            return rep.code(401).send({ message: 'Unauthorized.' });
        const jti = (0, crypto_1.randomUUID)();
        await refresh_token_model_1.default.create({
            expiresAt: (0, utils_1.expires7Days)(),
            jti,
            user: user._id
        });
        const sub = user._id.toString();
        const refreshToken = f.jwt.sign({
            jti,
            sub
        }, { expiresIn: '7d' });
        setCookie(rep, refreshToken);
        const token = f.jwt.sign({ sub }, { expiresIn: tokenTime });
        return rep.code(200).send({ email, name: user.name, token });
    }
    catch (e) {
        console.error(e);
        return rep.code(500).send({ message: 'Something went wrong. Try again later.' });
    }
};
exports.signIn = signIn;
const refresh = (f) => async (req, rep) => {
    try {
        const cookie = req.cookies.refresh_token;
        if (!cookie)
            return rep.code(401).send({ message: 'Unauthorized.' });
        let { jti, sub } = f.jwt.verify(cookie);
        if (!jti || !sub)
            return rep.code(401).send({ message: 'Unauthorized.' });
        const oldRefreshToken = await refresh_token_model_1.default.findOneAndUpdate({
            jti,
            user: sub,
            revoked: { $ne: true }
        }, {
            $set: {
                revoked: true,
                revokedAt: new Date()
            }
        }, { new: true });
        if (!oldRefreshToken)
            return rep.code(401).send({ message: 'Unauthorized.' });
        const user = await user_model_1.default.findById(sub);
        if (!user)
            return rep.code(401).send({ message: 'Unauthorized.' });
        const newJti = (0, crypto_1.randomUUID)();
        await refresh_token_model_1.default.create({
            jti: newJti,
            user: sub,
            expiresAt: (0, utils_1.expires7Days)()
        });
        const newRefreshToken = f.jwt.sign({
            jti: newJti,
            sub
        }, { expiresIn: '7d' });
        setCookie(rep, newRefreshToken);
        const token = f.jwt.sign({ sub }, { expiresIn: tokenTime });
        return rep.code(200).send({
            email: user.email,
            name: user.name,
            token
        });
    }
    catch (e) {
        console.error(e);
        console.error("REFRESH ERROR");
        return rep.code(500).send({ message: 'Something went wrong. Try again later.' });
    }
};
exports.refresh = refresh;
const verifyToken = (f) => async (req, rep) => {
    return rep.code(200).send({ message: 'Inside!' });
};
exports.verifyToken = verifyToken;
