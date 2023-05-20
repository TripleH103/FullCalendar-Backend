import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { ObjectId } from "mongoose";
import TaskModel from "../models/tasks";


interface TasksBody {
    resources: [{
        _id: {type: ObjectId},
        title: { type: String },
        pokemon: { type: String },
        eventColor: { type: String },
        manhour: { type: Number },
        children: [{    
            _id: {type: ObjectId},
            title: { type: String },
            pokemon: { type: String },
            eventColor: { type: String },
            manhour: { type: Number },
          }]
      }],
    events:[{
        _id: {type: ObjectId},
        resourceId: { type: String },
        start: { type: Date },
        end: { type: Date},
        title: { type: String},
    }]
}

export const createTasks : RequestHandler<unknown,unknown,TasksBody,unknown> = async (req, res, next) => {
    try {
        const body = req.body as TasksBody;
        const newTask = new TaskModel(body);
        await newTask.save();
        res.status(201).json({ message: "POST Created Successfully" });
    } catch (error) {
        next (error)
    }
};

export const getTasks: RequestHandler = async (req, res, next) => {
    try {
        const tasks = await TaskModel.find().exec();
        if(!tasks) {
            throw createHttpError(404, "there is no fucking tasks in the DB")
        }
        res.status(200).json(tasks)
    } catch (error) {
        next (error)
    }
};

interface filterParams {
    'resources.office'?:string;
    'resources.pokemon'?:string
  }
export const getFilterTasks: RequestHandler<unknown,unknown,unknown,filterParams> = async (req, res, next) => {
    try {
        const officeQuery = req.query['resources.office'];
        const pokemonQuery = req.query['resources.pokemon'];

        let officeTasks;
        if (officeQuery) {
            officeTasks = await TaskModel.find({'resources.office': officeQuery}).exec();
            if(!officeTasks) {
                throw createHttpError(404, 'nothing found in the DB')
            }
        }

        let pokemonTasks;
        if (pokemonQuery) {
            pokemonTasks = await TaskModel.find({'resources.pokemon': pokemonQuery}).exec();
            if(!pokemonTasks) {
                throw createHttpError(404, 'nothing found in the DB')
            }
        }

        if (officeTasks && pokemonTasks) {
            res.status(200).json({officeTasks, pokemonTasks});
            return;
        }

        if (officeTasks) {
            res.status(200).json(officeTasks);
            return;
        }

        if (pokemonTasks) {
            res.status(200).json(pokemonTasks);
            return;
        }
        throw createHttpError(400, 'Invalid query parameters');
    } catch (error) {
        next (error)
    }
}
