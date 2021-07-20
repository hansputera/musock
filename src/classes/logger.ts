import { blue } from "chalk";
import { resolve } from "path";
import { createLogger, format, Logger, transports } from "winston";

export default class LoggerWrapper {
    public logger: Logger;
    public myColors = {
        trace: "white",
        debug: "green",
        info: "blue",
        warn: "yellow",
        crit: "red",
        fatal: "magenta"
    };
    constructor(serviceName: string, isDev = false) {
        this.logger = createLogger({
            level: "info",
            format: format.combine(
                format.timestamp({
                    format: "DD-MM-YYYY | HH:mm:ss"
                }),
                format.prettyPrint(),
                format.splat(),
            ),
            defaultMeta: {
                service: serviceName,
            },
            transports: [
                new transports.File({ filename: resolve(__dirname, "..", "..", "storage", "logs", "error.log"), level: "error" }),
                new transports.File({ filename: resolve(__dirname, "..", "..", "storage", "logs", "fatal.log"), level: "fatal" }),
                new transports.File({ filename: resolve(__dirname, "..", "..", "storage", "logs", "warnings.log"), level: "warn" }),
                new transports.File({ filename: resolve(__dirname, "..", "..", "storage", "logs", "logging.log") })
            ]
        });

        const isoDate = new Date().toISOString();
        const borders = {
            border1: blue("["),
            border2: blue("]")
        };
        if (isDev) this.logger.add(new transports.Console({
            format: format.combine(
                format.printf((info) => {
                    const { level, message, stack } = info;
                    const prefix = `${borders.border1}${isoDate}${borders.border2}-${borders.border1}${level}${borders.border2}: `;
                    if (level == "warn" || level == "error" || level == "crit") return prefix + stack;
                    else return prefix + message;
                }),
                format.align(),
                format.colorize({
                    all: true
                })
            )
        }));
    }

    protected getLogger() {
        return this.logger;
    }
}