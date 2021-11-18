import { default as winston } from 'winston';

export class Logger {
  private static logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'FrontService' },
    transports: [
      new winston.transports.Console(),
    ],
  });

  static debug(msg: string): void {
    Logger.logger.debug(msg);
  }

  static info(msg: string): void {
    Logger.logger.info(msg);
  }

  static warn(msg: string): void {
    Logger.logger.warn(msg);
  }

  static error(msg: string): void {
    Logger.logger.error(msg);
  }

  static log(msg: string): void {
    Logger.info(msg)
  }
}