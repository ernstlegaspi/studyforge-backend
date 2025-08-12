"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    const redis = new ioredis_1.default(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        connectTimeout: 10_000,
        lazyConnect: false,
        retryStrategy: times => Math.min(times * 200, 2000)
    });
    fastify.decorate('redis', redis);
    fastify.addHook('onClose', async () => {
        await redis.quit();
    });
});
