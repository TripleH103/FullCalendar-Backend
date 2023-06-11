import { RequestHandler } from "express";
import createHttpError from "http-errors";
import TaskModel from "../models/tasks";

interface newTaskBody {
  resources: [
    {
      title?: string;
      pokemon?: [string];
      office?: string;
      eventColor?: string;
      manhour?: number;
      progress?: number;
      status?: string;
      children: [
        {
          title?: string;
          pokemon?: [string];
          office?: string;
          eventColor?: string;
          manhour?: number;
          progress?: number;
          status?: string;
        }
      ];
    }
  ];
  events: [
    {
      start?: Date;
      end?: Date;
      title?: string;
    }
  ];
}

export const createTask: RequestHandler<
  unknown,
  unknown,
  newTaskBody,
  unknown
> = async (req, res, next) => {
  try {
    const newTask = new TaskModel(req.body);
    await newTask.save();
    res.status(201).json({ message: "POST Created Successfully" });
  } catch (error) {
    next(error);
  }
};

// interface newChildQueryParams {
//   "resources.id": string;
// }

// interface newChild {
//   title?: string;
//   pokemon?: string[];
//   office?: string;
//   manhour?: number;
//   progress?: number;
//   status?: string;
// }
// interface ChildResource {
//   id?: string;
//   title?: string;
//   pokemon?: string[];
//   office?: string;
//   eventColor?: string;
//   manhour?: number;
//   progress?: number;
//   status?: string;
//   children?: Array<newChild>;
// }
// interface newChildEvent {
//   start: Date;
//   end: Date;
//   title: string;
// }

// interface newChildDocument {
//   resources: Array<ChildResource>;
//   events: newChildEvent;
// }


export const createChildTask: RequestHandler = async (req, res, next) => {
  try {
    const addChild = req.query["resources.id"];
    if (!addChild) {
      throw createHttpError( 404, "resources.id is invaild or no such resoureces")
    }
    const filter = {
      $or:[
        {"resources.id": addChild}
      ]
    }
    const newChild = req.body.resources[0].children
    const newEvent = req.body.events

    const task = await TaskModel.findOne(filter).exec();
    if (task) {

      if(newChild) {
        task.resources[0].children = task.resources[0].children.concat(newChild);
      }
      if(newEvent) {
        task.events = task.events.concat(newEvent)
      }
      await task.save();
      res.status(200).json(task)
    }
    else {
      throw createHttpError(404, "Task not found")
    }
  } catch (error) {
    next (error)
  }
}

export const getTasks: RequestHandler = async (req, res, next) => {
  try {
    const queryObj = {...req.query};
    const excludedFields = ['page', 'sort','limit'];
    excludedFields.forEach(item => delete queryObj[item]);
    console.log(req.query, queryObj)

    const tasks = await TaskModel.find(queryObj);
    if (!tasks) {
      throw createHttpError(404, "there is no fucking tasks in the DB");
    }
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};


interface updateEventQueryParams {
  "events.resourceId": string;
}

interface updateEventChild {
  id: string;
  title: string;
  pokemon: string[];
  office: string;
  manhour: number;
  progress: number;
  status: string;
}

interface updateEventResource {
  id: string;
  title: string;
  pokemon: string[];
  office: string;
  manhour: number;
  progress: number;
  status: string;
  children: updateEventChild[];
}

interface updateEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  progress:number;
}

interface updateSelectedTaskBody {
  resources: updateEventResource[];
  events: updateEvent[];
}
export const updateSelectedTask: RequestHandler<
  unknown,
  unknown,
  updateSelectedTaskBody,
  updateEventQueryParams
> = async (req, res, next) => {
  try {
    const eventResource = req.query["events.resourceId"];
    if (!eventResource) {
      throw createHttpError(404, "There is no events.resourceId");
    }
    const filter = {
      $or: [
        { "resources.id": eventResource },
        { "resources.children.id": eventResource },
      ],
    };
    const task = await TaskModel.findOne(filter).exec();
    if (task) {
      // Update resources
      if (req.body.resources) {
        req.body.resources.forEach(updateResource => {
          const resource = task.resources.find(
            resource => resource.id === updateResource.id
          );
          if (resource) {
            // Update resource properties
            resource.title = updateResource.title;
            resource.pokemon = updateResource.pokemon;
            resource.office = updateResource.office;
            resource.manhour = updateResource.manhour;
            resource.progress = updateResource.progress;
            resource.status = updateResource.status;

            // Update children
            if (updateResource.children) {
              updateResource.children.forEach(updateChild => {
                const child = resource.children.find(
                  child => child.id === updateChild.id
                );
                if (child && child.id === eventResource) {
                  // Update child properties
                  child.title = updateChild.title;
                  child.pokemon = updateChild.pokemon;
                  child.office = updateChild.office;
                  child.manhour = updateChild.manhour;
                  child.progress = updateChild.progress;
                  child.status = updateChild.status;
                }
              });
            }
          }
        });
      }

      // Update events
      if (req.body.events) {
        req.body.events.forEach(updateEvent => {
          const event = task.events.find(event => event.resourceId === updateEvent.resourceId);
          if (event && event.resourceId === eventResource) {
            // Update event properties
            event.title = updateEvent.title;
            event.start = updateEvent.start;
            event.end = updateEvent.end;
            event.resourceId = updateEvent.resourceId;
          }
        });
      }

      await task.save();
      res.json(task);
    }
  } catch (error) {
    next(error);
  }
};




interface filterParams {
  "resources.office"?: string;
  "resources.pokemon"?: string;
}
export const getFilterTasks: RequestHandler<
  unknown,
  unknown,
  unknown,
  filterParams
> = async (req, res, next) => {
  try {
    const officeQuery = req.query["resources.office"];
    const pokemonQuery = req.query["resources.pokemon"];

    let officeTasks;
    if (officeQuery) {
      officeTasks = await TaskModel.find({
        "resources.office": officeQuery,
      }).exec();
      if (!officeTasks) {
        throw createHttpError(404, "nothing found in the DB");
      }
    }

    let pokemonTasks;
    if (pokemonQuery) {
      pokemonTasks = await TaskModel.find({
        "resources.pokemon": pokemonQuery,
      }).exec();
      if (!pokemonTasks) {
        throw createHttpError(404, "nothing found in the DB");
      }
    }

    if (officeTasks && pokemonTasks) {
      res.status(200).json({ officeTasks, pokemonTasks });
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
    throw createHttpError(400, "Invalid query parameters");
  } catch (error) {
    next(error);
  }
};
