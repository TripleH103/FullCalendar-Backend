import { Document, InferSchemaType, model, Schema, Types } from "mongoose";

type taskTypes = {
  resources:[{
    _id:string;
    id:string;
    title: string;
    pokemon:string;
    eventColor:string;
    manhour:number;
    children:[{
      id:string
      title:string;
      pokemon:string;
      eventColor:string;
      manhour:number;
      _id:string;
    }]
  }]
  events:[{
    _id:string;
    id:string
    resourceId:string;
    start:Date;
    end:Date;
    title:string;
  }]
}

const tasksSchema = new Schema ({
    resources: [{
        id: { type: String },
        title: { type: String },
        pokemon: { type: String },
        office:{ type: String},
        eventColor: { type: String },
        manhour: { type: Number },
        children: [{
            id: { type: String },
            title: { type: String },
            pokemon: { type: String },
            office:{ type: String},
            eventColor: { type: String },
            manhour: { type: Number },
          }]
      }],
    events:[{
        id: { type: String },
        resourceId: { type: String },
        start: { type: Date },
        end: { type: Date},
        title: { type: String},
    }]
})

tasksSchema.pre<taskTypes & InferSchemaType<typeof tasksSchema>>('save', async function(next) {
     this.resources.forEach(resource => {
      if (resource.children && resource.children.length > 0) {
        resource.children.forEach((child, index) => {
          if (this.events[index]) {
            this.events[index].resourceId = child._id?.toString()
          }
        });
      } else {
        this.events.forEach(event => {
          event.resourceId = resource._id?.toString();
        });
      }
    });
    this.resources.forEach(resource => {
      resource.id = resource._id?.toString();
      resource.children.forEach(child => {
        child.id = child._id?.toString();
      })
    });
    this.events.forEach(event => {
      event.id = event._id?.toString();
    });
     next();
  });

type Tasks = InferSchemaType<typeof tasksSchema>;
export default model<Tasks>('Tasks', tasksSchema);