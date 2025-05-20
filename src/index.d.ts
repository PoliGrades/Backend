declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      name: string;
      iat: number;
      exp: number;
    };
  }
}

declare module "socket.io" {
  interface Socket {
    user?: {
      id: number;
      name: string;
    };
  }
}
