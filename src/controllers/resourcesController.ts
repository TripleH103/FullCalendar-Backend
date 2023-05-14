import { RequestHandler } from "express";
import createHttpError from "http-errors";
import ResourcesModel from "../models/resources";

interface CreateResourceBody {
    id?: string; 
    title?: string;
    pokemon?: string;
    eventColor?: string;
    manhour?: number;
    children: [{
      id?: string;
      title?: string;
      pokemon?: string;
      eventColor?: string;
      manhour?: number;
    }]
}

export const createResource: RequestHandler<unknown,unknown,CreateResourceBody,unknown> = async (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const pokemon = req.body.pokemon;
    const eventColor = req.body.eventColor;
    const manhour = req.body.manhour;
    const children = req.body.children;
    for (const child of children) {
        const id = child.id;
        const title = child.title;
        const pokemon = child.pokemon;
        const eventColor = child.eventColor;
        const manhour = child.manhour;
    };
    try{
        const newResource = await ResourcesModel.create({
            id: id,
            title: title,
            pokemon: pokemon,
            eventColor: eventColor,
            manhour: manhour,
            children: children,
        });
        res.status(201).json(newResource);
    } catch (error) {
        next(error);
    }
};

export const getResource: RequestHandler = async (req, res, next) => {
    try {
        const resources = await ResourcesModel.find().exec();
        if (!resources) throw Error ('Database is empty')
        else {
            res.status(200).json(resources)
        }
    } catch(error) {
        next(error)
    }
};