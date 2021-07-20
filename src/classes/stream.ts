import { Readable } from "stream";
import type { SocketSession } from "../typings/socket";
import { buildResult } from "./socket";
import YouTube from "./yt";
import Prism from "prism-media";
import WebSocketStream from "websocket-stream";

export default class StreamController {
    constructor(public socket: SocketSession, private encoding = false) {}
    public stream?: Readable = undefined;
    public streamDetails = {
        audioBitrate: 48000,
        audioChannels: 2
    };

    private yt = new YouTube();
    public async sendStream(url: string) {
        const stream = await this.yt.getStream(url);
        if (!stream) {
            return this.socket.socket.send(buildResult("stream-data-error", {
                url,
                date: new Date().toISOString(),
                message: "Not Found"
            }));
        } else {
            if (this.encoding) {
                const arg = this.yt.getFfmpegArgs(this.streamDetails.audioBitrate, this.streamDetails.audioChannels);
                const transcoder = new Prism.FFmpeg({
                    args: arg
                });
                const newStream = stream.pipe(transcoder);
                this.stream = newStream;
                const wsStream = WebSocketStream(this.socket.socket as unknown as string); // TODO: Fix this
                newStream.pipe(wsStream);
            } else {
                this.stream = stream;
                const wsStream = WebSocketStream(this.socket.socket as unknown as string); // TODO: Fix this
                stream.pipe(wsStream);
            }
        }
    }

    public async searchSongs(query: string) {
        const songs = await this.yt.gets(query);
        return this.socket.socket.send(buildResult("search-songs", {
            query, results: songs, date: new Date()
        }));
    }
}