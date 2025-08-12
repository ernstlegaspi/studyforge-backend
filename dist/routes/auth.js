"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = test;
async function test(f) {
    f.route({
        method: 'GET',
        url: '',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        hello: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            return { hello: "World" };
        }
    });
}
