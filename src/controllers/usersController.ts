import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/users";
import bcrypt from 'bcrypt';

interface SignUpBody {
    username?: string;
    email?: string;
    password?: string;
};

export const signUp: RequestHandler<unknown,unknown,SignUpBody,unknown> = async ( req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;

    try {
        if (!username ||!email ||!passwordRaw) {
            throw createHttpError(400, 'Parameters missed')
        }

        const existingUserName = await UserModel.findOne({username}).exec();
        if (existingUserName) {
            throw createHttpError(409, 'The Fucking Name has already existed.')
        };

        const existingEmail = await UserModel.findOne({ email: email}).exec();
        if (existingEmail) {
            throw createHttpError(409, 'The Fucking Email has already existed.')
        };

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const newUser = await UserModel.create({
            username: username,
            email: email,
            password: passwordHashed,
        });
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

export const getUsers: RequestHandler = async (req, res, next) => {
    try {
        const users = await UserModel.find().exec();
        if(!users){
            throw createHttpError(404, 'No fucking Users regiest')
        }
        else {
            res.status(200).json(users)
        };
    } catch(error) {
        next(error)
    }
};

