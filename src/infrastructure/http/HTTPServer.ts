import { default as express, Request, Response } from 'express';
import { default as expressWinston } from 'express-winston';
import { default as winston } from 'winston';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import { HTTPServerConf } from '../../util/Configuration';
import { getFsRouter } from './route/fsRouter';
import { Server } from 'http';

export class HTTPServer {
  private httpServerConf: HTTPServerConf;
  protected app: express.Express;

  // TODO pass jwt options too
  constructor(httpServerConf: HTTPServerConf) {
    this.httpServerConf = httpServerConf;
    this.app = express();
  }

  async init({
    createNewJobHAndler,
    getJobStatusHandler,
    getJobOutputHandler
  }: {
    createNewJobHAndler: (req: Request, res: Response) => Promise<void>;
    getJobStatusHandler: (req: Request, res: Response) => Promise<void>;
    getJobOutputHandler: (req: Request, res: Response) => Promise<void>;
  }): Promise<void> {
    this.initializeLogger(this.app);

    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser.json());

    //Set all routes from routes folder
    this.app.use(
      '/api/v1',
      await getFsRouter({
        createNewJobHAndler: createNewJobHAndler,
        getJobStatusHandler: getJobStatusHandler,
        getJobOutputHandler: getJobOutputHandler
      })
    );
  }

  private initializeLogger(app: express.Express): void {
    app.use(
      expressWinston.logger({
        transports: [new winston.transports.Console()]
      })
    );
    app.use(
      expressWinston.errorLogger({
        transports: [new winston.transports.Console()]
      })
    );
  }

  async start(): Promise<Server> {
    const httpServer: Server = await new Promise<Server>((resolve) => {
      const httpServer: Server = this.app.listen(this.httpServerConf.PORT);
      resolve(httpServer);
    });
    console.log(`HTTPServer running at https://localhost:${this.httpServerConf.PORT}`);
    return httpServer;
  }
}
