import { InferSchemaType, model, Schema } from "mongoose";

const usersSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, select: false},
    password: { type: String, required: true, unique: true, select: false},
});

type Users = InferSchemaType<typeof usersSchema>;

export default model<Users>("Users", usersSchema);