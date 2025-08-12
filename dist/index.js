"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const card_route_1 = __importDefault(require("./routes/card.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const jwt_1 = __importDefault(require("./plugins/jwt"));
const redis_1 = __importDefault(require("./plugins/redis"));
(async () => {
    dotenv_1.default.config();
    const app = (0, fastify_1.default)({
        ajv: {
            customOptions: {
                coerceTypes: false,
                allErrors: true
            }
        },
        logger: true
    });
    app.register(swagger_1.default, {
        openapi: {
            info: {
                title: 'My API',
                description: 'API documentation',
                version: '1.0.0'
            }
        }
    });
    app.register(swagger_ui_1.default, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false
        }
    });
    app.register(jwt_1.default);
    app.register(redis_1.default);
    app.register(cookie_1.default, {
        secret: process.env.COOKIE_SECRET,
        hook: 'onRequest'
    });
    app.register(cors_1.default, {
        credentials: true,
        origin: '*'
    });
    app.addSchema({
        $id: 'ErrorResponse',
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string' } }
    });
    // all routes goes below this line
    app.register(card_route_1.default, { prefix: '/api/card/' });
    app.register(user_route_1.default, { prefix: '/api/auth/' });
    try {
        const port = process.env.PORT || 3000;
        await mongoose_1.default.connect(process.env.DATABASE_URI);
        await app.listen({ port: Number(port) });
        console.log(`Server is running in PORT: ${port}`);
    }
    catch (e) {
        app.log.error(e);
    }
})();
