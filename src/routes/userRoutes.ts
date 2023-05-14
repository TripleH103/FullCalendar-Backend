import express from 'express';
import * as usersController from "../controllers/usersController";

const router = express.Router();

router.post("/signup", usersController.signUp);

router.get('/', usersController.getUsers);

export default router;