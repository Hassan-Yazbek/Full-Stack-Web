import { Request, Response } from "express";
import { pgPool } from "../index";

export const getTeams = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  try {
    const result = await pgPool.query(`
      SELECT 
        t.teamid, 
        t.teamname,
        t.teamleaderemail,
        t.createdat,
        COUNT(ts.taskid) AS task_count,
        (
          SELECT json_agg(json_build_object(
            'memberemail', tm.memberemail,
            'name', a.name,
            'last', a.last
          )) 
          FROM team_members tm
          JOIN accounts a ON tm.memberemail = a.email
          WHERE tm.teamid = t.teamid
        ) as members,
        (t.teamleaderemail = $1) as is_admin
      FROM teams t
      LEFT JOIN tasks ts ON t.teamid = ts.teamid
      WHERE t.teamleaderemail = $1 OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.teamid = t.teamid AND tm.memberemail = $1
      )
      GROUP BY t.teamid
    `, [email]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { teamName, newLeaderEmail } = req.body;
  const leaderEmail = req.session.user?.email;

  try {
    // Verify requester is team leader
    const teamCheck = await pgPool.query(
      "SELECT 1 FROM teams WHERE teamid = $1 AND teamleaderemail = $2",
      [teamId, leaderEmail]
    );
    
    if (teamCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updates = [];
    const params = [teamId];
    
    if (teamName) {
      updates.push("teamname = $" + (params.length + 1));
      params.push(teamName);
    }
    
    if (newLeaderEmail) {
      // Verify new leader is team member
      const memberCheck = await pgPool.query(
        "SELECT 1 FROM team_members WHERE teamid = $1 AND memberemail = $2",
        [teamId, newLeaderEmail]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(400).json({ error: "New leader must be a team member" });
      }
      
      updates.push("teamleaderemail = $" + (params.length + 1));
      params.push(newLeaderEmail);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    const query = `
      UPDATE teams 
      SET ${updates.join(", ")} 
      WHERE teamid = $1 
      RETURNING *
    `;
    
    const result = await pgPool.query(query, params);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update team" });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  const email = req.session.user?.email;
  const { teamName, members } = req.body;

  try {
    // Validate members
    const invalidEmails = [];
    for (const member of members) {
      const userCheck = await pgPool.query(
        "SELECT 1 FROM accounts WHERE email = $1",
        [member]
      );
      if (userCheck.rows.length === 0) invalidEmails.push(member);
    }
    
    if (invalidEmails.length > 0) {
      return res.status(400).json({ 
        error: "Invalid emails", 
        invalidEmails 
      });
    }

    const teamResult = await pgPool.query(
      "INSERT INTO teams (teamname, teamleaderemail) VALUES ($1, $2) RETURNING *",
      [teamName, email]
    );

    // Add members
    const teamId = teamResult.rows[0].teamid;
    await pgPool.query(
      "INSERT INTO team_members (teamid, memberemail) VALUES ($1, $2)",
      [teamId, email]
    );
    
    for (const member of members) {
      await pgPool.query(
        "INSERT INTO team_members (teamid, memberemail) VALUES ($1, $2)",
        [teamId, member]
      );
    }

    res.status(201).json(teamResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create team" });
  }
};

export const addMember = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { email } = req.body;
  const leaderEmail = req.session.user?.email;

  try {
    // Verify requester is team admin
    const teamCheck = await pgPool.query(
      "SELECT 1 FROM teams WHERE teamid = $1 AND teamleaderemail = $2",
      [teamId, leaderEmail]
    );
    
    if (teamCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if email exists
    const userCheck = await pgPool.query(
      "SELECT 1 FROM accounts WHERE email = $1",
      [email]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await pgPool.query(
      "INSERT INTO team_members (teamid, memberemail) VALUES ($1, $2)",
      [teamId, email]
    );
    
    res.status(201).json({ message: "Member added" });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { email } = req.params;

  try {
    const tasks=await pgPool.query("select taskid from tasks where teamid = $1", [teamId]);
    for (const row of tasks.rows) {
      await pgPool.query("DELETE FROM team_tasks WHERE taskid = $1 and memberemail=$2", [row.taskid,email]);
    }
    await pgPool.query(
      "DELETE FROM team_members WHERE teamid = $1 AND memberemail = $2",
      [teamId, email]
    );
    res.status(200).json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const leaderEmail = req.session.user?.email;

  try {
    // Verify that the requester is the team admin
    const teamCheck = await pgPool.query(
      "SELECT 1 FROM teams WHERE teamid = $1 AND teamleaderemail = $2",
      [teamId, leaderEmail]
    );

    if (teamCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Get all task IDs for this team
    const tasksResult = await pgPool.query(
      "SELECT taskid FROM tasks WHERE teamid = $1",
      [teamId]
    );

    for (const row of tasksResult.rows) {
      await pgPool.query("DELETE FROM team_tasks WHERE taskid = $1", [row.taskid]);
    }
    await pgPool.query("DELETE FROM inbox WHERE teamid = $1", [teamId]);
    await pgPool.query("DELETE FROM tasks WHERE teamid = $1", [teamId]);
    await pgPool.query("DELETE FROM team_members WHERE teamid = $1", [teamId]);
    await pgPool.query("DELETE FROM teams WHERE teamid = $1", [teamId]);

    return res.status(200).json({ message: "Team deleted" });
  } catch (err) {
    console.error("Error deleting team:", err);
    return res.status(500).json({ error: "Failed to delete team" });
  }
};

export const leaveTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const email = req.session.user?.email; // Ensure user session exists

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const leave = await pgPool.query(
      "DELETE FROM team_members WHERE teamid = $1 AND memberemail = $2 RETURNING *",
      [teamId, email]
    );

    if (typeof leave.rowCount === "number" && leave.rowCount > 0) {
      return res.status(200).json({ message: "Successfully left the team" });
    } else {
      return res.status(404).json({ message: "You are not part of this team" });
    }
  } catch (err) {
    console.error("Error leaving team:", err);
    return res.status(500).json({ message: "Error leaving the team" });
  }
};