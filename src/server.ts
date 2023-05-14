import mongoose from "mongoose";
import app from "./app";
import cleanEnv from "./utility/vaildate";

const port = cleanEnv.PORT;

mongoose.connect(cleanEnv.MONGO_CONNENTION_STR)
    .then(() => {
        console.log("MongoDB connected sucessfully!");
        app.listen(port, () => {
            console.log("Server Started on " + port);
        });
    })
    .catch(console.error);
