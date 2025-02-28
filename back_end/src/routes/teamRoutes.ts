import express from "express";
import { RequestHandler } from "express";
import {
  createTeam,
  addMember,
  removeMember,
  updateTeam,
  getTeams,
  deleteTeam,
  leaveTeam,
} from "../controller/teamController";

const router = express.Router();

// Routes
router.get("/getMembers", getTeams as RequestHandler);
router.post("/create", createTeam as RequestHandler);
router.put("/:teamId",updateTeam as RequestHandler);
router.post("/:teamId/addMember",addMember as RequestHandler);
router.put("/:teamId/removeMember/:email",removeMember as RequestHandler);
router.delete("/delete/:teamId",deleteTeam as unknown as RequestHandler);
router.put("/:teamId/leave",leaveTeam as unknown as RequestHandler)
export default router;
