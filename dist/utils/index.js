"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._500 = exports.expires7Days = exports.expires5Days = exports.expires3Days = exports.expires1Day = void 0;
const expires1Day = () => new Date(Date.now() + 24 * 60 * 60 * 1000);
exports.expires1Day = expires1Day;
const expires3Days = () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
exports.expires3Days = expires3Days;
const expires5Days = () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
exports.expires5Days = expires5Days;
// for token
const expires7Days = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
exports.expires7Days = expires7Days;
// status codes
const _500 = (rep) => rep.code(500).send({ message: 'Something went wrong. Try again later.' });
exports._500 = _500;
