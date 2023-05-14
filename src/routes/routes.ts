import express from "express";
import * as staffController from "../controllers/controller";

const router = express.Router();


router.get("/", staffController.getStaffs);

router.get("/table", staffController.getPagination);

router.get("/:staffid", staffController.getStaff);

router.post("/", staffController.createStaff);

router.patch("/:staffid", staffController.updateStaff);

export default router;