"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUser = void 0;
const checkUser = async (req, rep) => {
    try {
        const { sub } = req.user;
        if (!sub || sub !== req.params.ownerId)
            return rep.code(403).send({ message: 'Forbidden.' });
    }
    catch (e) {
        console.error(e);
        return rep.code(500).send({ message: 'Internal server error.' });
    }
};
exports.checkUser = checkUser;
