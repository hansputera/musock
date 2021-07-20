import { SockEvent } from "..";
import { buildResult } from "../classes/socket";
import type { SocketSession } from "../typings/socket";

export default class HelloEvent extends SockEvent {
    constructor() {
        super("hello");
    }

    public handler(sock: SocketSession) {
        return sock.socket.send(buildResult("hello-response", { message: "hello from server" }));
    }
}