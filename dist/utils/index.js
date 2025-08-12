"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expires7Days = void 0;
const expires7Days = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
exports.expires7Days = expires7Days;
