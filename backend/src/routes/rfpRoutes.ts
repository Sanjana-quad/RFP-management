import { Router } from "express";
import * as rfpController from "../controllers/rfpController";

const router = Router();

// POST /api/rfps/from-text
router.post("/from-text", rfpController.createRfpFromText);

// GET /api/rfps
router.get("/", rfpController.getAllRfps);

// GET /api/rfps/:id/comparison
router.get("/:id/comparison", rfpController.getRfpComparison);

// POST /api/rfps/:id/send
router.post("/:id/send", rfpController.sendRfpToVendors);

export default router;
