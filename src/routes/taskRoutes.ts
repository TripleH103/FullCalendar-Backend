import express from "express";
import * as taskController from "../controllers/tasksController";

const router = express.Router();

router
 .route('/')
 .get(taskController.getAllTasks)
 .post(taskController.createTask)
 .patch(taskController.updateSelectedTask);

 router
 .route('/update')
 .post(taskController.createChildTask);
 




// router.get("/find", taskController.getFilterTasks);
// router.patch("/update", taskController.updateSelectedTask);
// router.delete("/delete", taskController.deleteSelectedTask);
// router.post("/add/newChild", taskController.createChildTask);




export default router;