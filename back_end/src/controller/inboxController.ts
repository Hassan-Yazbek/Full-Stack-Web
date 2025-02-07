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
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to send message" });
    }
};

export const getTeamMessages = async (req: Request, res: Response) => {
    const { teamId } = req.params;

    try {
        const result = await pgPool.query(`
            SELECT i.*, a.name, a.email 
            FROM inbox i
            JOIN accounts a ON i.commenterid = a.id
            WHERE i.teamid = $1
            ORDER BY i.createdat DESC
        `, [teamId]);
        
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};