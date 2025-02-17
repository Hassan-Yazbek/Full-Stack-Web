import { Request, Response } from "express";
import { pgPool } from "../index";

export const getTodayTasks = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  if (!email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const result = await pgPool.query(
      `SELECT DISTINCT 
    tm.teamname,
    t.taskname,
    to_char(t.startdate, 'YYYY-MM-DD') AS startdate, 
    to_char(t.enddate, 'YYYY-MM-DD') AS enddate,
    t.priority
    FROM tasks t
    JOIN team_tasks tt ON t.taskid = tt.taskid
    JOIN teams tm ON t.teamid = tm.teamid
    WHERE tt.memberemail = $1 
    AND t.startdate = $2`,
      [email, today]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching today's tasks:", err);
    return res.status(500).json({ error: "Failed to get today tasks" });
  }
};
