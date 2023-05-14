import express from 'express';
import * as resourceController from "../controllers/resourcesController";

const router = express.Router();

router.get("/", resourceController.getResource);
router.post("/", resourceController.createResource);

export default router;