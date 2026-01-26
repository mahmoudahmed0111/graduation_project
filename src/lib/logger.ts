/**
 * Logger utility for consistent error and debug logging
 * In production, console logs are disabled and errors can be sent to tracking services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  error?: Error | unknown;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const context = options?.context ? `[${options.context}]` : '';
    return `${context} ${message}`.trim();
  }

  private log(level: LogLevel, message: string, options?: LogOptions) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Don't log debug messages in production
    }

    const formattedMessage = this.formatMessage(level, message, options);
    const logData = options?.data ? { ...options.data } : {};

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, logData);
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(formattedMessage, logData);
        }
        break;
      case 'warn':
        console.warn(formattedMessage, logData);
        break;
      case 'error':
        console.error(formattedMessage, options?.error || logData);
        // In production, send to error tracking service (e.g., Sentry)
        if (this.isProduction && options?.error) {
          // TODO: Integrate with error tracking service
          // errorTrackingService.captureException(options.error, { extra: logData });
        }
        break;
    }
  }

  debug(message: string, options?: LogOptions) {
    this.log('debug', message, options);
  }

  info(message: string, options?: LogOptions) {
    this.log('info', message, options);
  }

  warn(message: string, options?: LogOptions) {
    this.log('warn', message, options);
  }

  error(message: string, options?: LogOptions) {
    this.log('error', message, options);
  }
}

export const logger = new Logger();

