import { InferSchemaType, model, Schema } from "mongoose";

const translationMemorySchema = new Schema ({
    title: { type: String },
    jpn_text: { type: String },
    cnzh_text: { type: String },
    eng_text: { type: String },
    platform: [{type: String}],
    slug:[{type:String}],
    release: { type: Date },
})

type Memories = InferSchemaType<typeof translationMemorySchema>;

export default model<Memories>("Memories", translationMemorySchema);