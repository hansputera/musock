import { SockEvent } from "..";
import { buildResult } from "../classes/socket";
import StreamController from "../classes/stream";
import type { SocketSession } from "../typings/socket";

export default class SearchSongEvent extends SockEvent {
    constructor() {
        super("search_song", [
            "searchSong", "cariLagu", "findSong", "find-song", "find_song", "search-song"
        ]);
    }

    public async handler(sock: SocketSession, data: unknown) {
        const query = (data as Record<string, unknown>).query;
        if (!query) return sock.socket.send(buildResult("search-songs", {
            message: "Missing query"
        }));

        const Yt = new StreamController(sock, false);
        return await Yt.searchSongs(query as string);
    }
}