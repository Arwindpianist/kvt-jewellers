/**
 * Secure Production Logging Utility
 * 
 * In production, all logs are suppressed or sent to secure logging service.
 * In development, logs are displayed normally for debugging.
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  environment: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Secure logger - only logs in development mode
 * In production, logs are suppressed or sent to monitoring service
 */
class SecureLogger {
  private shouldLog(level: LogLevel): boolean {
    // Always log errors, even in production (but securely)
    if (level === 'error') {
      return true;
    }
    
    // Only log debug/info in development
    if (level === 'debug' || level === 'info') {
      return isDevelopment;
    }
    
    // Log warnings and regular logs only in development
    return isDevelopment;
  }

  private formatMessage(message: string, data?: any): string {
    if (data) {
      try {
        return `${message} ${JSON.stringify(data)}`;
      } catch {
        return `${message} [Non-serializable data]`;
      }
    }
    return message;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
    };
  }

  /**
   * Send error to secure logging service in production
   * In development, just console.error
   */
  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    if (isDevelopment) {
      return; // Already logged to console
    }

    // In production, you can integrate with logging services like:
    // - Sentry
    // - LogRocket
    // - Datadog
    // - Custom API endpoint
    
    // For now, we suppress logs in production
    // Uncomment and configure when ready:
    /*
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Silently fail - don't break the app
    }
    */
  }

  log(message: string, ...args: any[]): void {
    if (!this.shouldLog('log')) {
      return;
    }
    
    const entry = this.createLogEntry('log', message, args.length > 0 ? args : undefined);
    console.log(`[${entry.timestamp}]`, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) {
      return;
    }
    
    const entry = this.createLogEntry('warn', message, args.length > 0 ? args : undefined);
    console.warn(`[${entry.timestamp}]`, message, ...args);
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    // Always log errors, but securely in production
    const entry = this.createLogEntry('error', message, error || args);
    
    if (isDevelopment) {
      console.error(`[${entry.timestamp}]`, message, error, ...args);
      if (error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      // In production, send to logging service
      this.sendToLoggingService(entry);
      
      // Only show minimal error to console (for critical errors)
      // Most errors should be handled gracefully in the UI
      console.error('[Production Error]', message);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) {
      return;
    }
    
    const entry = this.createLogEntry('debug', message, args.length > 0 ? args : undefined);
    console.debug(`[${entry.timestamp}]`, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) {
      return;
    }
    
    const entry = this.createLogEntry('info', message, args.length > 0 ? args : undefined);
    console.info(`[${entry.timestamp}]`, message, ...args);
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export type for TypeScript
export type Logger = SecureLogger;
