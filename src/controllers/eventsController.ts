import { RequestHandler } from "express";
import createHttpError from "http-errors";
import EventsModel from "../models/events";

interface CreateEventBody {
    id?: string;
    resourceId?: string;
    start?: Date;
    end?: Date;
    title?: string;
};

export const createEvent: RequestHandler<unknown,unknown,CreateEventBody,unknown> = async (req, res, next) => {
    const id = req.body.id;
    const resourceId = req.body.resourceId;
    const start = req.body.start;
    const end = req.body.end;
    const title = req.body.title;

    try{
        const newEvent = await EventsModel.create({
            id: id,
            resourceId: resourceId,
            start: start,
            end: end,
            title: title,
        }); res.status(201).json(newEvent)
    } catch (error) {
        next(error);
    }
};


export const getEvents: RequestHandler = async (req, res, next) => {
    try {
        const events = await EventsModel.find().exec();
        if (!events) {
            throw Error ('Database is empty')
        } else {
            res.status(200).json(events)
        }
    } catch (error) {
        next(error)
    }
};
