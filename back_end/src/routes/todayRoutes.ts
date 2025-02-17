import express from "express";
import {RequestHandler } from "express";
import { getTodayTasks } from "../controller/todayController";


const router=express.Router();

router.post("/todays",getTodayTasks as unknown as RequestHandler);

export default router;
