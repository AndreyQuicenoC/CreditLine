/**
 * Logger service for comprehensive application logging.
 * Supports multiple log levels and targets.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  stack?: string;
}

class Logger {
  private isDev: boolean = import.meta.env.DEV;
  private isProduction: boolean = import.meta.env.PROD;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  /**
   * Log a message with the given level.
   */
  private logMessage(
    level: LogLevel,
    module: string,
    message: string,
    data?: unknown,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      stack: error?.stack,
    };

    // Store in memory (for debugging)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output based on environment and log level
    // Always log in dev, in production only log errors and critical
    const shouldLog =
      this.isDev || 
      (!this.isDev && (level === LogLevel.ERROR || level === LogLevel.CRITICAL || level === LogLevel.WARN));

    if (!shouldLog) return;

    const style = this.getConsoleStyle(level);
    const prefix = `[${entry.timestamp}] [${level}] [${module}]`;

    if (data) {
      console[level === LogLevel.CRITICAL ? 'error' : 'log'](
        `%c${prefix} ${message}`,
        style,
        data
      );
    } else {
      console[level === LogLevel.CRITICAL ? 'error' : 'log'](
        `%c${prefix} ${message}`,
        style
      );
    }

    if (error?.stack) {
      console.error(error.stack);
    }

    // Send to server for critical/error logs in production
    if (
      this.isProduction &&
      (level === LogLevel.ERROR || level === LogLevel.CRITICAL)
    ) {
      this.sendToServer(entry);
    }
  }

  /**
   * Get console styling based on log level.
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: #888; font-weight: normal;',
      [LogLevel.INFO]: 'color: #0066cc; font-weight: bold;',
      [LogLevel.WARN]: 'color: #ff9900; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #cc0000; font-weight: bold;',
      [LogLevel.CRITICAL]: 'color: #990000; font-weight: bold; background: #ffcccc;',
    };
    return styles[level] || 'color: inherit;';
  }

  /**
   * Send log entry to server for persistence.
   */
  private sendToServer(entry: LogEntry): void {
    try {
      // In a real app, send to a logging service
      navigator.sendBeacon(
        '/api/logs',
        JSON.stringify(entry)
      ).catch(() => {
        // Silently fail - don't block on logging errors
      });
    } catch (err) {
      // Silently fail
    }
  }

  /**
   * Public API: Debug logs
   */
  public debug(module: string, message: string, data?: unknown): void {
    this.logMessage(LogLevel.DEBUG, module, message, data);
  }

  /**
   * Public API: Info logs
   */
  public info(module: string, message: string, data?: unknown): void {
    this.logMessage(LogLevel.INFO, module, message, data);
  }

  /**
   * Public API: Warning logs
   */
  public warn(module: string, message: string, data?: unknown): void {
    this.logMessage(LogLevel.WARN, module, message, data);
  }

  /**
   * Public API: Error logs
   */
  public error(module: string, message: string, error?: Error, data?: unknown): void {
    this.logMessage(LogLevel.ERROR, module, message, data, error);
  }

  /**
   * Public API: Critical logs
   */
  public critical(module: string, message: string, error?: Error, data?: unknown): void {
    this.logMessage(LogLevel.CRITICAL, module, message, data, error);
  }

  /**
   * Get all stored logs (for debugging)
   */
  public getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear stored logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();

// Make available in window for debugging
if (import.meta.env.DEV) {
  (window as any).logger = logger;
  (window as any).LogLevel = LogLevel;
  console.log('Logger available as window.logger');
}
