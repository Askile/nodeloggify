# Logger

This is a simple logging utility for Node.js, providing color-coded console output with customizable formatting. It includes features such as delayed logging, queuing of log messages, and writing log messages to a specified output file.

## Console Formatters

The `CONSOLE_FORMATTERS` object defines various formatting options for console output. These include color codes for text and background, as well as styles like bold, italic, and underline.

## Logger Class 

### Constructor

```javascript
/**
 * @param {{delay?: number, outputFile?: string, discordWebhook?: string}} config - Configuration for the logger.
 */
constructor(config)
```

- `delay` (optional): The delay in milliseconds for logging. If specified, log messages will be delayed by this amount.
- `outputFile` (optional): The path to an output file. If specified, log messages will be written to this file in addition to the console.
- `discordWebhook` (optional): The path to discord webhook to send log before app exit.

### Methods

#### `log(message: string)`

Adds a log message to the queue.

#### `error(message: string)`

Adds an error message to the queue.

#### `warn(message: string)`

Adds a warning message to the queue.

### Static Method

#### `fastLog(message: string)`

A static method for quickly logging a message to the console without queuing.

### Internal Methods

#### `setupInterval()`

Sets up the interval for processing the log message queue.

#### `moveQueue()`

Moves the queue and logs the messages. If an output file is specified, writes the message to the file.

### Example Usage

```javascript
const loggerConfig = {
    delay: 1000, // Log delay in milliseconds
    outputFile: "last.log", // Output file path
    discordWebhook: "https://discord.com/api/webhooks/1177695602105127033/Ch4dpONwcbCC5RLc4JG7Wjcl6yucej2I783cwqz6SsnsWVLod4QMRxBAnLxtuUuFL-9y"
};

const logger = new Logger(loggerConfig);

logger.log("This is a log message.");
logger.error("This is an error message.");
logger.warn("This is a warning message.");

// For quick logging without queuing
Logger.fastLog("This is a fast log message.");
```

Feel free to customize the configuration and use the logger according to your needs.