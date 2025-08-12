"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const findByEmail = async (id) => {
    const user = await user_model_1.default.findById({ id });
    return user ? true : false;
};
exports.findByEmail = findByEmail;
