import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { ObjectId } from "mongoose";
import TaskModel from "../models/tasks";


interface newTaskBody {
  resources: [{
      title?: string;
      pokemon?: [string];
      office?: string;
      eventColor?: string;
      manhour?: number;
      progress?:number;
      status?:string
      children: [{    
          title?: string;
          pokemon?: [string];
          office?: string;
          eventColor?: string;
          manhour?: number;
          progress?:number;
          status?:string
        }]
    }],
  events:[{
      start?: Date;
      end?: Date;
      title?: string;
  }]
}

export const createTask : RequestHandler<unknown,unknown,newTaskBody,unknown> = async (req, res, next) => {
    try {
        const newTask = new TaskModel(req.body);
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


interface queryParams {
  'events.resourceId':string;
}

interface Child {
id: string;
title: string;
pokemon: string[];
office: string;
manhour: number;
progress: number;
status: string;
}

interface Resource {
id: string;
title: string;
pokemon: string[];
office: string;
manhour: number;
progress: number;
status: string;
children:Child[];
}

interface Event {
id: string;
title: string;
start: Date;
end: Date;
resourceId:string;
}

interface updateTaskBody {
resources: Resource[];
events: Event[];
}
export const updateTask: RequestHandler<unknown,unknown,updateTaskBody,queryParams> = async (req, res, next) => {
  try {
    const eventResource = req.query['events.resourceId'];
    if (!eventResource) {
      throw createHttpError(404, "There is no events.resourceId");
    }
    const filter = {
      $or: [
        { "resources.id": eventResource },
        { "resources.children.id": eventResource }
      ]
    };
    const task = await TaskModel.findOne(filter);
    if (task) {
      // Update resources
      if (req.body.resources) {
        task.resources = req.body.resources;
      }
      // Update events
      if (req.body.events) {
        task.events = req.body.events;
      }

      await task.save();
      res.json(task);
    } else {
      throw createHttpError(404, "No task found for your selection!");
    }
  } catch (error) {
    next(error);
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
