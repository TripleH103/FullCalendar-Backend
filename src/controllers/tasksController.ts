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

export const createChildTask: RequestHandler = async (req, res, next) => {
  try {
    const addChild = req.query["resources.id"];
    if (!addChild) {
      throw createHttpError(
        404,
        "resources.id is invaild or no such resoureces"
      );
    }
    const filter = {
      $or: [{ "resources.id": addChild }],
    };
    const newChild = req.body.resources[0].children;
    const newEvent = req.body.events;

    const task = await TaskModel.findOne(filter).exec();
    if (task) {
      if (newChild) {
        task.resources[0].children =
          task.resources[0].children.concat(newChild);
      }
      if (newEvent) {
        task.events = task.events.concat(newEvent);
      }
      await task.save();
      res.status(200).json(task);
    } else {
      throw createHttpError(404, "Task not found");
    }
  } catch (error) {
    next(error);
  }
};


// class APIFeatures {
//   query: any;
//   queryString: any;

//   constructor(query:any, queryString: any) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     const queryObj = {...this.queryString};
//     const excludedFields = ["page","sort","limit","fields"];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|let|lt)\b/g, match => `$${match}`)

//   }
// }

export const getAllTasks: RequestHandler<unknown,unknown,unknown,any> = async (req, res, next) => {
  try {
    console.log(req.query);
    // Bulid Query
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit","field"];
    excludedFields.forEach((item) => delete queryObj[item]);
    
    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = TaskModel.find(JSON.parse(queryStr));

    // 2) Sorting
    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    }

    // 3) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // EXECUTE QUERY
    const tasks = await query;

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
  progress: number;
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
        req.body.resources.forEach((updateResource) => {
          const resource = task.resources.find(
            (resource) => resource.id === updateResource.id
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
              updateResource.children.forEach((updateChild) => {
                const child = resource.children.find(
                  (child) => child.id === updateChild.id
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
        req.body.events.forEach((updateEvent) => {
          const event = task.events.find(
            (event) => event.resourceId === updateEvent.resourceId
          );
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

interface eventParams {
  "events.resourceId": string;
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

interface pullResource {
  id: string;
  title: string;
  pokemon: string[];
  office: string;
  manhour: number;
  progress: number;
  status: string;
  children: Child[];
}

interface pullEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  progress: number;
}

interface pullSelectedTaskBody {
  resources: pullResource[];
  events: pullEvent[];
}

export const deleteSelectedTask: RequestHandler<
  unknown,
  unknown,
  pullSelectedTaskBody,
  eventParams
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
    const task = await TaskModel.findOne(filter);
    if (task) {
      task.resources.forEach((resource) => {
        if (resource.children && resource.children.length > 0) {
          resource.children.forEach((child) => {
            if (child.id === eventResource) {
              TaskModel.updateOne(
                { _id: task._id },
                { $pull: { "resource.children": { id: eventResource } } }
              );
            }
          });
        } else if (resource.id === eventResource) {
          TaskModel.updateOne(
            { _id: task._id },
            { $pull: { resources: { id: eventResource } } }
          );
        }
      });
      task.events.forEach((event) => {
        if (event.resourceId === eventResource) {
          TaskModel.updateOne(
            { _id: task._id },
            { $pull: { events: { resourceId: eventResource } } }
          );
        }
      });
    }
    res.status(204).json();
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
