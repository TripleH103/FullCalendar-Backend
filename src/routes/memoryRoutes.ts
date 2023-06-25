import express from "express";
import * as memoryController from '../controllers/memoryController';

const router = express.Router();

router
.route('/')
.get(memoryController.getMemories)

export default router;
