import { InferSchemaType, model, Schema } from "mongoose";

const resourcesSchema = new Schema({
    id: { type: String },
    title: { type: String },
    pokemon: { type: String },
    eventColor: { type: String },
    manhour: { type: Number },
    children: [{
      id: { type: String },
      title: { type: String },
      pokemon: { type: String },
      eventColor: { type: String },
      manhour: { type: Number },
    }]
});

type Resources = InferSchemaType<typeof resourcesSchema>;

export default model<Resources>('Resources', resourcesSchema);