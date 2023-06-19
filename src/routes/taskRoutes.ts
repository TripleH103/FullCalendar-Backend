import express from "express";
import * as taskController from "../controllers/tasksController";

const router = express.Router();

router.get("/find", taskController.getFilterTasks);
router.get("/", taskController.getTasks);
router.patch("/update", taskController.updateSelectedTask);
router.delete("/delete", taskController.deleteSelectedTask);
router.post("/add/newChild", taskController.createChildTask);
router.post("/add", taskController.createTask);



export default router;