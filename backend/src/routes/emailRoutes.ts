import { Router } from "express";
import * as emailController from "../controllers/emailController";

const router = Router();

// POST /api/emails/poll
router.post("/poll", emailController.pollEmails);

export default router;
