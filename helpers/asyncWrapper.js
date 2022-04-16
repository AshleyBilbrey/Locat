import { Request, Response, NextFunction } from "express";

const asyncWrap = async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        next(err);
    }
};

export default asyncWrap;
