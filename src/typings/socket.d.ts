import type { IncomingMessage } from "http";
import type WebSocket from "ws";

export interface SocketEvents {
    new_connection: (authenticated: boolean, socket: WebSocket, request: IncomingMessage) => void;
    disconnected_connection: (authenticated: boolean, socket: WebSocket, request: IncomingMessage) => void;
    new_message: (authenticated: boolean, socket: WebSocket, request: IncomingMessage) => void;
    authenticated_connection: (socket: WebSocket, request: IncomingMessage) => void;
    new_event: (event: string, data: unknown, sock: WebSocket, req: IncomingMessage) => void;
}

export interface SocketSession {
    ip: string | string[];
    authenticated: boolean;
    authenticated_at?: Date;
    connection_at?: Date;
    socket: WebSocket;
    key: string;
}