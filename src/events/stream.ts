import { SockEvent } from "..";
import { buildResult } from "../classes/socket";
import StreamController from "../classes/stream";
import { SocketSession } from "../typings/socket";

export default class StreamEvent extends SockEvent {
    constructor() {
        super("stream-download", [
            "stream-dl", "get-stream", "stream_download", "stream_dl", "streamdl"
        ]);
    }

    public async handler(sock: SocketSession, data: Record<string, unknown>) {
        const url = data.url;
        if (!url) return sock.socket.send(buildResult("stream-data-error", {
            message: "Missing URL"
        }));
        const encoding = data.encoding ? true : false;

        const Yt = new StreamController(sock, encoding);
        return await Yt.sendStream(url as string);
    }
}