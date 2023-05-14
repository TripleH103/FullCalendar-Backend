import express from "express";
import * as eventController from '../controllers/eventsController';

const router = express.Router();

router.get("/", eventController.getEvents);
router.post("/", eventController.createEvent);

export default router;