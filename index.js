import {createWriteStream, readFileSync, WriteStream} from "fs";
/**
 * Console formatters.
 * @type {{BG_CYAN: string, BG_RED: string, BLUE: string, BG_BLUE: string, RESET: string, UNDERLINE: string, BOLD: string, DOUBLE_UNDERLINE: string, REVERSE: string, ITALIC: string, WHITE: string, BG_MAGENTA: string, DIM: string, GREEN: string, RED: string, INVISIBLE: string, OVERLINE: string, STRIKETHROUGH: string, BLINK: string, BG_YELLOW: string, MAGENTA: string, BG_GREEN: string, YELLOW: string, CYAN: string, BG_WHITE: string}}
 */
export const CONSOLE_FORMATTERS = {
    RESET: "\x1b[0m",
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",
    ITALIC: "\x1b[3m",
    UNDERLINE: "\x1b[4m",
    BLINK: "\x1b[5m",
    OVERLINE: "\x1b[6m",
    REVERSE: "\x1b[7m",
    INVISIBLE: "\x1b[8m",
    STRIKETHROUGH: "\x1b[9m",
    DOUBLE_UNDERLINE: "\x1b[21m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m",
    BG_RED: "\x1b[41m",
    BG_GREEN: "\x1b[42m",
    BG_YELLOW: "\x1b[43m",
    BG_BLUE: "\x1b[44m",
    BG_MAGENTA: "\x1b[45m",
    BG_CYAN: "\x1b[46m",
    BG_WHITE: "\x1b[47m"
}
export class Logger {
    /**
     * @param {{discordWebhook?: string, delay?: number, outputFile?: string, beforeExit?: (reason?: number) => undefined}} config - Configuration for the logger.
     */
    constructor(config) {
        /**
         * Stack of log messages.
         * @type {string[]}
         */
        this.logs = [];
        /**
         * Last log activity.
         * @type {number}
         */
        this.lastActivity = Date.now();
        /**
         * Stack of log messages.
         * @type {string[]}
         */
        this.queue = [];
        /**
         * Delay in milliseconds.
         * @type {number}
         */
        this.delay = config.delay ?? 0;
        /**
         * IntervalID.
         * @type {undefined | number}
         */
        this.interval = undefined;
        /**
         * Write stream.
         * @type {undefined | WriteStream}
         */
        this.stream = undefined;
        /**
         * If config.outputFile is a path, create a write stream.
         */
        if(typeof config.outputFile === "string") {
            this.stream = createWriteStream(config.outputFile);
        }
        process.once("beforeExit", async reason => {
            /**
             * If config.discordWebhook is defined, set up process exit handler.
             */
            if(config.discordWebhook) {
                /**
                 * Form data to send.
                 * @type {FormData}
                 */
                const form = new FormData();
                /**
                 * Add log file to form.
                 */
                form.append("file", new Blob([readFileSync(config.outputFile)]), config.outputFile);
                form.append("payload_json", JSON.stringify({content: "Process exiting with reason: " + reason}));
                /**
                 * Send logs to discord webhook.
                 */
                await fetch(config.discordWebhook, {
                    method: "POST",
                    headers: new Headers(),
                    body: form
                });
            }
            /**
             * If config.beforeExit is defined, call it.
             */
            if(typeof config.beforeExit === "function") {
                config.beforeExit(reason);
            }
        });
    }
    /**
     * Adds a fast log message to the queue.
     * @param {string} message
     */
    static fastLog(message) {
        /**
         * Add log message to queue.
         */
        console.log(
            CONSOLE_FORMATTERS.GREEN + "[" + new Date().toISOString() + "]",
            "[LOG]" + CONSOLE_FORMATTERS.RESET,
            message
        );
    }
    /**
     * Sets up the interval.
     */
    setupInterval() {
        /**
         * IntervalID.
         * @type {number}
         */
        this.interval = setInterval(() => {
            /**
             * If the delay has passed, clear the interval.
             */
            if(Date.now() - this.lastActivity >= 500) {
                clearInterval(this.interval);
                this.interval = undefined;
            }
            /**
             * If the queue is not empty, move the queue and log the message.
             */
            this.queue.length && this.moveQueue();
        }, this.delay);
    }

    /**
     * Moves the queue and log the message.
     */
    moveQueue() {
        /**
         * Get the message from the queue.
         */
        const [timestamp, type, message] = this.queue.splice(0, 3);
        const log = (timestamp + " " + type + " " + (typeof message === "object" ? JSON.stringify(message) : message)).replace(/\x1b\[\d+m/g, "") + "\n";
        /**
         * Log the message.
         */
        console.log(timestamp, type, message);
        /**
         * If the output file is not empty, write the message to the file.
         */
        if(this.stream !== undefined) {
            this.stream.write(log);
        }
        /**
         * Add log message to stack.
         */
        this.logs.push(log);
        /**
         * Update last activity.
         */
        this.lastActivity = Date.now();
    }
    /**
     * Adds a log message to the queue.
     * @param {string} message - The message to be logged.
     */
    log(message) {
        const timestamp = CONSOLE_FORMATTERS.BLUE + "[" + new Date().toLocaleTimeString()  + "]";
        const type = "<LOG>" + CONSOLE_FORMATTERS.RESET;
        /**
         * Add log message to queue.
         */
        this.queue.push(
            timestamp,
            type,
            message
        );
        /**
         * If the interval is undefined, setup interval.
         */
        this.interval === undefined && this.setupInterval();
    }
    /**
     * Adds an error message to the queue.
     * @param {string} message - The error message to be added.
     */
    error(message) {
        const timestamp = CONSOLE_FORMATTERS.BLUE + "[" + new Date().toLocaleTimeString() + "]";
        const type = "<ERROR>" + CONSOLE_FORMATTERS.RESET;
        /**
         * Add log message to queue.
         */
        this.queue.push(
            timestamp,
            type,
            message
        );
        /**
         * If the interval is undefined, setup interval.
         */
        this.interval === undefined && this.setupInterval();
    }
    /**
     * Adds a warning message to the queue.
     * @param {string} message - The warning message to be added to the queue.
     */
    warn(message) {
        const timestamp = CONSOLE_FORMATTERS.BLUE + "[" + new Date().toLocaleTimeString() + "]";
        const type = "<WARN>" + CONSOLE_FORMATTERS.RESET;
        /**
         * Add log message to queue.
         */
        this.queue.push(
            timestamp,
            type,
            message
        );
        /**
         * If the interval is undefined, setup interval.
         */
        this.interval === undefined && this.setupInterval();
    }
}