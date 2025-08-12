"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.register(jwt_1.default, { secret: process.env.JWT_SECRET });
    fastify.decorate('authenticate', async (req, rep) => {
        try {
            await req.jwtVerify();
        }
        catch (e) {
            rep.code(401).send({ message: 'Unauthorized' });
        }
    });
});
