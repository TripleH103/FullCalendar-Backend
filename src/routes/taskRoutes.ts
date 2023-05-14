import express from "express";
import * as taskController from "../controllers/tasksController";

const router = express.Router();

router.get("/", taskController.getTasks);
router.post("/", taskController.createTasks);

export default router;