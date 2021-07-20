import ytdl from "ytdl-core";
import ScrapeYoutube from "scrape-youtube";

export default class YouTube {
    public scraper = ScrapeYoutube;

    public async gets(query: string) {
        const response = await this.scraper.search(query);
        return {
            videos: response.videos,
            streams: response.streams
        };
    }

    public async get(url: string) {
        const isValid = ytdl.validateURL(url);
        if (!isValid) return undefined;
        const response = await ytdl.getInfo(url);
        return response;
    }

    public async getStream(url: string) {
        const isValid = ytdl.validateURL(url);
        if (!isValid) return undefined;
        const stream = ytdl(url, {
            filter: "audioonly",
            quality: "lowest"
        });

        return stream;
    }

    public getFfmpegArgs(audioBitrate = 48000, channels = 2, otherArgs: string[] = []) {
        return [
            "-analyzeduration",
            "0",
            "-acodec",
            "pcm_s161e",
            "-f",
            "s161e",
            "-ar",
            audioBitrate.toString(),
            "-ac",
            channels.toString()
        ].concat(otherArgs);
    }
}