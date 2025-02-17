//backend/src/controller/taskController
import { Request, Response } from "express";
import { pgPool } from "../index";
import { error } from "console";

export const createTask = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  const { taskName, startDate, endDate, description, teamName, priority } = req.body;
  let teamid, taskid;

  try {
    // Get team ID
    const getdata = await pgPool.query(
      "SELECT teamid FROM teams WHERE teamleaderemail=$1 AND teamname=$2",
      [email, teamName]
    );

    if (getdata.rows.length === 0) {
      return res.status(404).json({ error: "Team not found or unauthorized" });
    }

    teamid = getdata.rows[0].teamid;

    // Insert into tasks and return the inserted task
    const insertToTasks = await pgPool.query(
      "INSERT INTO tasks (taskname, startdate, enddate, description, priority, creatoremail, teamid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING taskid",
      [taskName, startDate, endDate, description, priority, email, teamid]
    );

    taskid = insertToTasks.rows[0].taskid;

    // Get team members
    const members = await pgPool.query(
      "SELECT memberemail FROM team_members WHERE teamid=$1",
      [teamid]
    );

    // Assign task to each team member
    for (const member of members.rows) {
      await pgPool.query(
        "INSERT INTO team_tasks (memberemail, taskid, status) VALUES ($1, $2, 'Not Done')",
        [member.memberemail, taskid]
      );
    }

    return res.status(201).json({ message: "Task created successfully" });

  } catch (err) {
    console.error("Error creating task:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTask = async (req: Request, res: Response) => {
  const email = req.session.user?.email;

  try {
    const result = await pgPool.query(
      `SELECT 
        t.taskid, 
        t.taskname, 
        to_char(t.startdate, 'YYYY-MM-DD') AS startdate, 
        to_char(t.enddate, 'YYYY-MM-DD') AS enddate,
        t.description, 
        t.priority, 
        t.creatoremail,
        t.teamid,
        te.teamname,
        tt.status AS user_status,
        (t.creatoremail = $1 OR te.teamleaderemail = $1) AS is_admin
      FROM tasks t
      JOIN teams te ON t.teamid = te.teamid
      LEFT JOIN team_tasks tt ON tt.taskid = t.taskid AND tt.memberemail = $1
      WHERE 
        t.creatoremail = $1 OR
        te.teamleaderemail = $1 OR
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.teamid = t.teamid AND tm.memberemail = $1
        )
      ORDER BY t.startdate DESC`,
      [email]
    );

    const tasks = result.rows.map((task: any) => ({
      ...task,
      admin: task.is_admin ? "true" : "false",
    }));

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};


export const getteam = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  try {
    const result = await pgPool.query(
      "SELECT teamname FROM teams t,team_members tm WHERE t.teamid=tm.teamid AND memberemail = $1 and t.teamleaderemail = $1", [email]);
    return res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  console.log(email)
  const { taskname, startdate, enddate, description, teamname, priority, teamid } = req.body;
  const taskid = req.params.taskid; // Extract taskid from URL params

  // Validate required fields
  if (!taskname || !startdate || !enddate || !description || !priority || !teamid) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log(teamid);
    const taskUpdateResult = await pgPool.query(
      "UPDATE tasks SET taskname = $1, startdate = $2, enddate = $3, description = $4, priority = $5 WHERE taskid = $6 AND teamid=$7 RETURNING *",
      [taskname, startdate, enddate, description, priority, taskid,teamid]
    );

    // Check if the task was updated
    if (taskUpdateResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found or not authorized to update this task" });
    }

    // Update the team (if necessary)
    const teamUpdateResult = await pgPool.query(
      "UPDATE teams SET teamname = $1 WHERE teamid = $2 RETURNING *",
      [teamname, teamid]
    );

    // Send response
    res.status(200).json({
      task: taskUpdateResult.rows[0],
      team: teamUpdateResult.rows[0],
    });
  } catch (err) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task", details: error });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  const { taskid } = req.body;

  try {
    const currentStatus = await pgPool.query(
      "SELECT status FROM team_tasks WHERE taskid = $1 AND memberemail = $2",
      [taskid, email]
    );

    const newStatus = currentStatus.rows[0].status === 'Done' ? 'Not Done' : 'Done';

    const result = await pgPool.query(
      "UPDATE team_tasks SET status = $1 WHERE taskid = $2 AND memberemail = $3 RETURNING *",
      [newStatus, taskid, email]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};


export const deleteTask = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  console.log(email);
  const { taskid } = req.params;

  try {
    await pgPool.query(
      "DELETE FROM team_tasks WHERE taskid = $1 RETURNING *",
      [taskid]
    );

    const result = await pgPool.query(
      "DELETE FROM tasks WHERE taskid = $1 RETURNING *",
      [taskid]
    );

    res.status(200).json({ message: "Task deleted successfully", task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
