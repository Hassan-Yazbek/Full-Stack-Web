import express, { RequestHandler } from "express";
import { createTask, getTask,getteam, updateTask, deleteTask,updateStatus } from "../controller/taskController";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Routes
router.post("/create", createTask);         
router.get("/tasks", getTask as RequestHandler); 
router.get("/team",getteam as RequestHandler);   
router.put("/update-status", updateStatus as RequestHandler);           
router.put("/update/:taskid", updateTask as RequestHandler);
router.delete("/delete", deleteTask as RequestHandler);  


export default router;
