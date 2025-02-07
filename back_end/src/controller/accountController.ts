//src/controller/accountController
import { Request, Response } from 'express';
import passport from 'passport';
import { pgPool } from '../index';
import bcrypt from 'bcryptjs';


export const createAccount = async (req: Request, res: Response) => {
  const { name, last, email, password } = req.body;

  if (!name || !last || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const client = await pgPool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    const hashedPassword = await bcrypt.hash(password, 10);

    const accountResult = await client.query(
      'INSERT INTO accounts (email, name, last, password) VALUES ($1, $2, $3, $4) RETURNING id, email, name, last',
      [email, name, last, hashedPassword]
    );

    await client.query(
      'INSERT INTO teams (teamleaderemail, teamname) VALUES ($1, $2)',
      [email, "My Tasks"]
    );
    
    const teamid= await client.query(
      'SELECT teamid from teams where teamleaderemail=$1 and teamname=$2',
      [email, "My Tasks"]
    );

    await client.query(
      'INSERT INTO team_members(teamid,memberemail) values($1,$2)',[teamid.rows[0].teamid,email]
    )

    await client.query('COMMIT');

    req.login(accountResult.rows[0], (err) => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }

      return res.status(201).json({
        message: 'Account created and logged in successfully',
        user: accountResult.rows[0],
      });
    });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed due to an internal error' });
  } finally {
    client.release(); // Release the client back to the pool
  }
};


export const loginAccount = (req: Request, res: Response) => {
  passport.authenticate('local', (err: any, user: Express.User, info: { message: any; }) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: loginErr });
      }

      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        last: user.last,
      };
      
      req.session.save((err) => {
        if (err) console.error('❌ Session save error:', err);
      });

      return res.json({
        message: 'Logged in successfully',
        user: req.session.user,
      });
    });
  })(req, res);
};


export const logoutAccount = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Could not destroy session' });
      }
      res.clearCookie('connect.sid'); // clear session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
};



export const getAccount = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Check if account exists
    const result = await pgPool.query("SELECT * FROM accounts WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    const account = result.rows[0];
    const storedHash = account.password;

    // Verify password
    const passwordMatch = await bcrypt.compare(password, storedHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    
    res.status(200).json({
      message: "Logged in successfully",
      account,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
