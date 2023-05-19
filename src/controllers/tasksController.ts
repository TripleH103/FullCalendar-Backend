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