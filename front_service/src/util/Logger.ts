export class Logger {
  static log(msg: string): void {
    console.log(`${new Date().toISOString()}: ${msg}`);
  }
}