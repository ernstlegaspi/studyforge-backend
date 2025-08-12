"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = void 0;
const zod_1 = require("zod");
exports.signUpSchema = zod_1.z.object({
    email: zod_1.z.email({ error: "Please ener a valid email." }).min(5, { error: "Email should be at least 5 characters." }),
    name: zod_1.z.string({ error: "Please enter a valid name." }).min(2, { error: "Name should be at least 2 characters." }),
    password: zod_1.z.string({ error: "Please enter a valid password." }).min(8, { error: "Password should be at least 8 characters." })
});
