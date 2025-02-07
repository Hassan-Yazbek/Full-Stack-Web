// src/types/express-session.d.ts (or any appropriate location)

import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      last: string;
    };
    passport?: {
      user: {
        id: string;
        email: string;
        name: string;
        last: string;
      };
    };
  }
}

declare module 'express' {
  // Use SessionData directly rather than wrapping it in Partial<>
  interface Request {
    session: import('express-session').Session & import('express-session').SessionData;
  }
}
