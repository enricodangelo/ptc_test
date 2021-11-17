import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { default as expressWinston } from 'express-winston';
import { default as winston } from 'winston';



export class HTTPServer {
  private _port: number;
  private _app: express.Express;

  constructor(port: number) {
    this._port = port;
    this._app = express();
  }

  init() {
    this.initializeLogger(this._app);

    /* mount all routes to API version 1 */
    this.registerRoutes();
  }

  registerRoutes(): void {
    this._app.use('/api/v1/job', postJobHandler);
    this._app.use('/api/v1/job/:id', getJobStatusHandler);
    this._app.use('/api/v1/job/:id/output', getJobOutputHandler);
  }

  initializeLogger(app: express.Express): void {
    app.use(
      expressWinston.logger({
        transports: [new winston.transports.Console()],
      })
    );
    app.use(
      expressWinston.errorLogger({
        transports: [new winston.transports.Console()],
      })
    );
  }

  async start(): Promise<void> {
    new Promise<void>((resolve) => {
      this._app.listen(this._port, () => {
        resolve();
      });
    });
    console.log(`HTTPServer running at https://localhost:${this._port}`);
  }
}

(async () => {
  const server = new ExpressServer(parseInt(process.argv[2]));

  server.init();
  await server.start();
})().catch((error) => {
  console.log(JSON.stringify(error));
});
