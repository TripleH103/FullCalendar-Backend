import "dotenv/config";
import express, { NextFunction, Request, Response} from "express";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from 'cors';
import staffRouters from "./routes/routes";
import userRouters from './routes/userRoutes';
import resourceRouters from './routes/resourceRoutes';
import eventRouters from './routes/eventRoutes';
import taskRouters from './routes/taskRoutes';

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(cors())

app.use("/api/users", userRouters);
app.use("/api/staffs", staffRouters);
app.use("/api/tasks", taskRouters);

app.use((req,res,next) => { 
    next(createHttpError(404,"Endpoint not found"));
});

app.use((error:unknown, req:Request, res:Response, next:NextFunction) => {
        console.error(error)
        let errorMessage = "What's the fucking going on with u?"
        let statusCode = 500;
        if(isHttpError(error)) {
            statusCode = error.status;
            errorMessage = error.message;
        } res.status(statusCode).json({error:errorMessage});
});
export default app