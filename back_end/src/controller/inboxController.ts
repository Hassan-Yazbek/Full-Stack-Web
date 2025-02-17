import { Request, Response } from "express";
import { pgPool } from "../index";

export const sendMessage = async (req: Request, res: Response) => {
    const { teamId, message, taskId } = req.body;
    const userId = req.session.user?.id;

    try {
        const result = await pgPool.query(
            "INSERT INTO inbox (commenterid, commenttext, teamid, relatedtaskid) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, message, teamId, taskId]
        );
        const fullname=await pgPool.query("select name,last from accounts where id=$1",[userId])
        result.rows[0].name=fullname.rows[0].name;
        result.rows[0].last=fullname.rows[0].last;
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to send message" });
    }
};

export const getTeam = async (req: Request, res: Response) => {
    const email = req.session.user?.email;
    
    if (!email) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    console.log("Fetching teams for email:", email); // Debug log
  
    try {
      const result = await pgPool.query(
        "SELECT teamname, t.teamid FROM teams t JOIN team_members tm ON t.teamid = tm.teamid WHERE tm.memberemail = $1;",
        [email]
      );
      
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching teams:", err);
      res.status(500).json({ error: "Failed to get team" });
    }
  };
  
  
export const getTeamMessages = async (req: Request, res: Response) => {
    const email=req.session.user?.email;
    const { teamId } = req.body;

    try {
        const result = await pgPool.query(`
            SELECT i.*, a.name,a.last, a.email 
            FROM inbox i
            JOIN accounts a ON i.commenterid = a.id
            WHERE i.teamid = $1
            ORDER BY i.createdat DESC
        `, [teamId]);

        for(const row of result.rows){
            if(row.email ===email){
                row.isMine = true;
            }
        }
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};