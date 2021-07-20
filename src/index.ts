import "dotenv/config";
import { readdirSync } from "fs";
import type { IncomingMessage } from "http";
import { join } from "path";
import Musocket from "./classes/socket";
import type { EventProp } from "./typings/events";
import type { SocketSession } from "./typings/socket";

const socket = new Musocket();
const events: Record<string, EventProp> = {};

export class SockEvent {
    constructor(public name: string, public aliases: string[] = []) {
        events[name] = this;

        socket.logger.info(`Event ${name} has been loaded`);
    }

    public handler(sock: SocketSession, data: unknown, req: IncomingMessage) {}
}
// collecting all event.
for (const event of readdirSync(join(__dirname, "events")).filter(fl => fl.endsWith(".js"))) {
    new (require(join(__dirname, "events", event)).default)();
}

socket.on("new_event", async (event, data, _, req) => {
    const sockSession = socket.sessions.get(req.headers["sec-websocket-key"]);
    const events_ = Object.values(events);

    const ev = events_.find(e => e.name == event || e.aliases.includes(event));
    if (ev) {
        socket.logger.info(`${sockSession.ip}|${sockSession.key} running event ${ev.name}`);
        ev.handler(sockSession, data, req);
    }
});

socket.on("authenticated_connection", (_, req) => {
    socket.logger.info(`Connection authenticated: ${req.headers["sec-websocket-key"]}`);
});