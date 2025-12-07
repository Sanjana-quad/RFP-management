import { Router } from "express";
import * as vendorController from "../controllers/vendorController";

const router = Router();

router.post("/", vendorController.createVendor);
router.get("/", vendorController.getVendors);

export default router;
