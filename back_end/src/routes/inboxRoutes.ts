import express from "express";
import { RequestHandler } from "express";
import { sendMessage, getTeamMessages,getTeam } from "../controller/inboxController";

const router = express.Router();

// Routes
router.post("/teams",getTeam as RequestHandler);
router.post("/messages", getTeamMessages); 
router.post("/send", sendMessage);     // Add a new message
export default router;
