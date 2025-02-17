declare module 'ws' {
  interface WebSocket {
    teamId?: string | null;
    close: () => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    readyState: number;
    send: (data: string) => void;
  }
}
