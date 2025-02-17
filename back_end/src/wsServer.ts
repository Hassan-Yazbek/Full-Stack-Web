// backend/wsServer.ts
import { WebSocketServer } from 'ws';

export const attachWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Optional: Extend the WebSocket type globally if needed via a separate declaration file (e.g., ws.d.ts)
  // Alternatively, use type assertion when needed.

  wss.on('connection', (ws: { on: (arg0: string, arg1: { (message: any): void; (): void; }) => void; OPEN: any; }, req: { url: any; headers: { host: any; }; }) => {
    // Construct URL from request
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const teamId = url.searchParams.get('teamId');
    console.log(`WebSocket connection established for team: ${teamId} `);

    // Attach teamId property using type assertion
    (ws as any).teamId = teamId;

    ws.on('message', (message:void) => {
      console.log(`Received message: ${message}`);
      // Broadcast the message to all clients in the same team
      wss.clients.forEach((client: { readyState?: any; send?: any; on?: (arg0: string, arg1: { (message: any): void; (): void; }) => void; OPEN?: any; }) => {
        if (client !== ws && (client as any).teamId === teamId && client.readyState === ws.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed for team: ${teamId}`);
    });
  });

  console.log('WebSocket server attached on /ws');
};
