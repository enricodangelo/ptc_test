import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { default as expressWinston } from 'express-winston';
import { default as winston } from 'winston';

let nextId: number = 1;
const statuses: string[] = ['CLOUD_STARTED', 'CLOUD_EXECUTING', 'CLOUD_DONE', 'CLOUD_ERROR'];

function postJob(req: express.Request, res: express.Response) {
  if (Math.random() < 0.5) {
    res.status(StatusCodes.OK).send({id: nextId++, status: statuses[0]});
  } else {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

function getJobStatus(req: express.Request, res: express.Response) {
  const id: number = parseInt(req.params["id"]);
  let status: String = statuses[id % statuses.length];
  res.status(StatusCodes.OK).send({ id: id, status: status });
}

export class ExpressServer {
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
    this._app.use('/api/v1/job', postJob);
    this._app.use('/api/v1/job/:id', getJobStatus);
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
  const server = new ExpressServer(parseInt(process.argv[2]) || 9001);

  server.init();
  await server.start();
})().catch((error) => {
  console.log(JSON.stringify(error));
});
