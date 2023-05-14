import { InferSchemaType, model, Schema } from "mongoose";

const staffSchema = new Schema({
    id:{ type:Number, required:true},
    name:{ type:String, required:true},
    post:{ type:String, required:true},
});

type Staff = InferSchemaType<typeof staffSchema>;

export default model<Staff>("Staff", staffSchema);