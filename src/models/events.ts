import { InferSchemaType, model,Schema } from "mongoose";

const eventsSchema = new Schema({
    id: { type: String },
    resourceId: { type: String },
    start: { type: Date },
    end: { type: Date},
    title: { type: String},
})

type Events = InferSchemaType<typeof eventsSchema>;
export default model<Events>('Events', eventsSchema);