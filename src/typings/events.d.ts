import type { IncomingMessage } from "http";
import type { SocketSession } from "./socket";

export interface EventProp {
    name: string;
    handler(socket: SocketSession, data: unknown, req?: IncomingMessage): Promise<void> | void;
    aliases: string[];
}