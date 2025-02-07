//backend/src/controller/taskController
import { Request, Response } from "express";
import { pgPool } from "../index";



export const createTask = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  const { taskName, startDate, endDate, description, teamName,priority } = req.body;
  let teamid,taskid;

  try {
    const getdata=await pgPool.query(
      "select teamid from teams where teamleaderemail=$1 and teamname=$2",[email,teamName]
    );
    if(getdata){
      teamid=getdata.rows[0].teamid;
    }
    const insertToTasks = await pgPool.query(
      "INSERT INTO tasks (taskname, startdate, enddate, description,priority, creatoremail,teamid) VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING *",
      [taskName, startDate, endDate, description, priority,email, teamid]
    );
    const getTaskId=await pgPool.query(
      "SELECT taskid FROM tasks WHERE teamid=$1 AND creatoremail=$2 AND taskname=$3 ORDER BY taskid DESC LIMIT 1;"
      ,[teamid,email,taskName]
    );
    taskid=getTaskId.rows[0].taskid;
    const inserIntoTeam =await pgPool.query(
      "Insert into team_tasks (memberemail,taskid,status) values ($1,$2,'Not Done')",[email,taskid]
    )
    if(inserIntoTeam){
      res.status(201).json(insertToTasks.rows[0]);
    }
    res.status(404);
  } catch (err) {
    res.status(500).json({ error: err });
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
    const result = await pgPool.query("SELECT teamname FROM teams t,team_members tm WHERE t.teamid=tm.teamid AND memberemail = $1 ", [email]);
    return res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  const { taskname, startdate, enddate, description, teamname, priority, teamid } = req.body;
  const taskid = req.params.taskid;  // Extract taskid from the URL params

  try {
    const taskUpdateResult = await pgPool.query(
      "UPDATE tasks SET taskname = $1, startdate = $2, enddate = $3, description = $4, priority = $5 WHERE taskid = $6 AND creatoremail = $7 AND teamid = $8 RETURNING *",
      [taskname, startdate, enddate, description, priority, taskid, email, teamid]
    );

    const teamUpdateResult = await pgPool.query(
      "UPDATE teams SET teamname = $1 WHERE teamid = $2 RETURNING *",
      [teamname, teamid]
    );

    if (taskUpdateResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found or not authorized to update this task" });
    }

    // You might only want to send the updated task in the response (if team was updated separately)
    res.status(200).json({
      task: taskUpdateResult.rows[0],
      team: teamUpdateResult.rows[0]
    });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  const { taskid } = req.body;

  try {
    console.log(taskid);
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
  const { taskName } = req.params;

  try {
    const result = await pgPool.query(
      "DELETE FROM tasks WHERE taskname = $1 AND creatoremail = $2 RETURNING *",
      [taskName, email]
    );
    const result1 = await pgPool.query(
      "DELETE FROM team_tasks WHERE taskName = $1 AND creatoremail = $2 RETURNING *",
      [taskName, email]
    );

    res.status(200).json({ message: "Task deleted successfully", task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
