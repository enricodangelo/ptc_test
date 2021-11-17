import express from 'express';
import { default as expressWinston } from 'express-winston';
import { default as winston } from 'winston';
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { FSRouter } from './route';

export class HTTPServer {
  private _port: number;
  private _app: express.Express;
  private fsRouter: FSRouter;

  constructor(port: number, fsRouter: FSRouter) {
    this._port = port;
    this._app = express();
    this.fsRouter = fsRouter;
  }

  init() {
    this.initializeLogger(this._app);

    this._app.use(cors());
    this._app.use(helmet());
    this._app.use(bodyParser.json());

    //Set all routes from routes folder
    this._app.use("/", this.fsRouter.getRouter);
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
