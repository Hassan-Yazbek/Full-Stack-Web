import express from "express";
import { sendMessage, getTeamMessages } from "../controller/inboxController";

const router = express.Router();

// Routes
router.post("/create", sendMessage);     // Add a new message
router.get("/:commenterId", getTeamMessages);  // Get messages by commenter ID

export default router;
