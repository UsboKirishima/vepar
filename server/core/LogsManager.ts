export default class LogsManager {
    private logs: string[] = [];
  
    /**
     * Adds a new log message to the list.
     * @param message - The log message to add.
     */
    public addLog(message: string): void {
      const timestamp = new Date().toISOString();
      this.logs.push(`[${timestamp}] ${message}`);
    }
  
    /**
     * Retrieves all log messages.
     * @returns An array of log messages.
     */
    public getLogs(): string[] {
      return this.logs;
    }
  
    /**
     * Retrieves log messages filtered by a specific keyword.
     * @param keyword - The keyword to filter by.
     * @returns An array of log messages containing the keyword.
     */
    public filterLogs(keyword: string): string[] {
      return this.logs.filter(log => log.includes(keyword));
    }
  
    /**
     * Clears all log messages.
     */
    public clearLogs(): void {
      this.logs = [];
    }
  }
  