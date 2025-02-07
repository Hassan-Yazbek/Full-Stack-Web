import express from "express";
import { RequestHandler } from "express";
import {
  createTeam,
  addTeamMember,
  removeMember,
  updateTeam,
  getTeams,
} from "../controller/teamController";

const router = express.Router();

// Routes
router.get("/getMembers", getTeams as RequestHandler);
router.post("/create", createTeam as RequestHandler);
router.put("/:teamId",updateTeam as RequestHandler);
router.post("/:teamId/addMember",addTeamMember as RequestHandler);
router.delete("/:teamId/removeMember/:email",removeMember as RequestHandler);

export default router;
