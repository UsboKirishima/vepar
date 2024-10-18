import { colors } from '.'; 

/**
 * Logger class for logging messages to the terminal with colors.
 * 
 * The Logger provides different logging levels:
 * - `info` for informational messages.
 * - `warn` for warning messages.
 * - `error` for error messages.
 * - `success` for success messages.
 * - `log` for generic log messages.
 * 
 * All logs are displayed in the terminal with colors for emphasis.
 */
export class Logger {
    /**
     * Logs an informational message with blue text.
     *
     * @param message - The message to be logged.
     */
    public static info(message: string) {
        console.log(colors.Blue + 'INFO: ' + message);
    }

    /**
     * Logs a warning message with yellow text.
     *
     * @param message - The message to be logged.
     */
    public static warn(message: string) {
        console.log(colors.Yellow + 'WARNING: ' + message);
    }

    /**
     * Logs an error message with red text.
     *
     * @param message - The message to be logged.
     */
    public static error(message: string) {
        console.log(colors.Red + 'ERROR: ' + message);
    }

    /**
     * Logs a success message with green text.
     *
     * @param message - The message to be logged.
     */
    public static success(message: string) {
        console.log(colors.Green + 'SUCCESS: ' + message);
    }

    /**
     * Logs a generic message with white text.
     *
     * @param message - The message to be logged.
     */
    public static log(message: string) {
        console.log(colors.White + message);
    }
}
