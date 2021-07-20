import env from "../env";
import { TypedEmitter } from "tiny-typed-emitter";
import type { SocketEvents, SocketSession } from "../typings/socket";
import LoggerWrapper from "./logger";
import CustomMap from "./map";
import WebSocket from "ws";

export default class Musocket extends TypedEmitter<SocketEvents> {
    public sessions: CustomMap<string, SocketSession> = new CustomMap();
    public ws = new WebSocket.Server({
        port: env.PORT,
        perMessageDeflate: true
    });
    public logger = new LoggerWrapper("socket", env.isDevelopment).logger;
    constructor() {
        super();
        this.logger.info("Websocket started at: " + env.PORT);
        this.ws.on("connection", (sock, req) => {
            const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const key = req.headers["sec-websocket-key"];

            if (!key) {
                sock.send(this.buildResult("error", "Websocket key not detected"));
                sock.close(1001, "Websocket key not detected");
                return;
            }

            this.logger.info(`New connection from: ${ip}|UA:${req.headers["user-agent"]}|WKEY:${key}`);
            this.sessions.ensure(key, {
                socket: sock,
                ip,
                authenticated: false,
                authenticated_at: undefined,
                connection_at: new Date(),
                key
            });
            this.emit("new_connection", false, sock, req);
            this.logger.info(`Session saved: ${key}`);

            sock.on("message", (chunk) => {
                try {
                    const currSock = this.sessions.get(key);
                    const json = JSON.parse(chunk as unknown as string);
                    const isValidData = this.validMessage(json);
                    if (!isValidData) {
                        sock.send(this.buildResult("error", {
                            message: "Invalid data"
                        }));
                        return;
                    } else {
                        if (json.event != "auth" && !currSock.authenticated) {
                            sock.send(this.buildResult("auth_required", {
                                message: "Not authenticated"
                            }));
                            return;
                        } else if (json.event == "auth") {
                            if (currSock.authenticated) return sock.send(this.buildResult("auth_already", {
                                message: "Already authenticated"
                            }));
                            else {
                                if (!json.data.password || json.data.password != env.AUTHENTICATION_PASSWORD) return sock.send(this.buildResult("error", {
                                    message: "Invalid password"
                                }));
                                const sessionObj: SocketSession = {
                                    ip,
                                    key,
                                    authenticated: true,
                                    authenticated_at: new Date(),
                                    connection_at: currSock.connection_at,
                                    socket: sock
                                };
                                this.sessions.set(key, sessionObj);
                                this.emit("authenticated_connection", sock, req);
                                sock.send(this.buildResult("authenticated", {
                                    message: "Your session has authenticated, congratulations!"
                                }));
                            }
                        } else {
                            this.emit("new_event", json.event, json.data, sock, req);
                        }
                    }
                } catch (e) {
                    this.logger.error(e);
                    sock.send(this.buildResult("error", e));
                }
            });
            sock.on("close", () => {
                const curr_sock = this.sessions.get(key);
                this.logger.info(`Connection closed: ${key}`);
                this.sessions.delete(key);
                this.emit("disconnected_connection", curr_sock.authenticated, sock, req);
            });
        });

        this.ws.on("error", (err) => {
            this.logger.error(err.message);
        });
    }

    private validMessage(data: Record<string, unknown>) {
        if (!data.event || !data.data) return false;
        else return true;
    }

    private buildResult = buildResult;
}

export function buildResult(eventName: string, data: unknown) {
    return JSON.stringify({
        event: eventName,
        data
    });
}