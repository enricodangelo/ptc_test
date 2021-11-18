
import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { CreateNewJob } from "../../../application/usecases/CreateNewJob";
import { GetJobOutput } from "../../../application/usecases/GetJobOutput";
import { GetJobStatus } from "../../../application/usecases/GetJobStatus";
import { ClientIdentity } from "../../../domain/entity/ClientIdentity";
import { JOB_STATUS, SavedJob } from "../../../domain/entity/Job";
import { JobId } from "../../../domain/entity/JobId";
import { JobOutput } from "../../../domain/entity/JobOutput";
import { Logger } from "../../../util/Logger";
import { checkMD5 } from "../../../util/MD5Utils";
import { PTCError, PTCERROR_TYPE } from "../../../util/PTCError";

export class JobController {
  static createNewJob = async (createNewJobUseCase: CreateNewJob) => {
    return async (req: Request, res: Response) => {
      try {
        let { MD5, content, mimetype } = req.body;
        let { clientId, tenentId } = res.locals.jwtPayload;

        // NOTE: disabled for testing
        // // option to disable MD5 checks, usefull while testing
        // if (!checkMD5(content, MD5)) {
        //   throw new PTCError(PTCERROR_TYPE.WRONG_INPUT, 'md5 mismatch');
        // }

        const job: SavedJob = await createNewJobUseCase.createNewJob({
          clientId: clientId,
          tenentId: tenentId,
        });
        createNewJobUseCase.submitNewBlob({
          job: job,
          base64Content: content,
          mimetype: mimetype
        }).catch((error: any) => { Logger.log(JSON.stringify(error)) })

        res.status(StatusCodes.CREATED).send({
          id: job.id.value,
          status: job.status
        });
      } catch (error) {
        if (error instanceof PTCError) {
          switch (error.name) {
            case PTCERROR_TYPE.WRONG_INPUT:
              res.status(StatusCodes.BAD_REQUEST).send((error as Error).message);
              break;
            case PTCERROR_TYPE.NOT_FOUND:
              res.status(StatusCodes.NOT_FOUND).send((error as Error).message);
              break;
            case PTCERROR_TYPE.NOT_AUTHORIZED:
              res.status(StatusCodes.UNAUTHORIZED).send((error as Error).message);
              break;
            case PTCERROR_TYPE.FORBIDDEN:
              res.status(StatusCodes.FORBIDDEN).send((error as Error).message);
              break;
            case PTCERROR_TYPE.EXT_SERVICE_ERROR:
              res.status(StatusCodes.SERVICE_UNAVAILABLE).send((error as Error).message);
              break;
            case PTCERROR_TYPE.EXT_SERVICE_ERROR:
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as Error).message);
              break;
          }
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as Error).message);
        }
      }
    };
  }

  static getJobStatus = async (getJobStatusUseCase: GetJobStatus) => {
    return async (req: Request, res: Response) => {
      try {
        let { jobId } = req.params;
        let { clientId, tenentId } = res.locals.jwtPayload;

        const status: JOB_STATUS = await getJobStatusUseCase.getJobStatus({
          id: new JobId(parseInt(jobId)),
          clientIdentity: new ClientIdentity(clientId, tenentId)
        });

        res.status(StatusCodes.OK).send({
          id: jobId,
          status: status
        });
      } catch (error) {
        if (error instanceof PTCError) {
          switch (error.name) {
            case PTCERROR_TYPE.WRONG_INPUT:
              res.status(StatusCodes.BAD_REQUEST).send((error as Error).message);
              break;
            case PTCERROR_TYPE.NOT_FOUND:
              res.status(StatusCodes.NOT_FOUND).send((error as Error).message);
              break;
            case PTCERROR_TYPE.NOT_AUTHORIZED:
              res.status(StatusCodes.UNAUTHORIZED).send((error as Error).message);
              break;
            case PTCERROR_TYPE.FORBIDDEN:
              res.status(StatusCodes.FORBIDDEN).send((error as Error).message);
              break;
            case PTCERROR_TYPE.EXT_SERVICE_ERROR:
              res.status(StatusCodes.SERVICE_UNAVAILABLE).send((error as Error).message);
              break;
            case PTCERROR_TYPE.EXT_SERVICE_ERROR:
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as Error).message);
              break;
          }
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as Error).message);
        }
      }
    };
  }

  static getJobOutput = async (getJobOutputUseCase: GetJobOutput) => {
    return async (req: Request, res: Response) => {
      try {
        let { jobId } = req.params;
        let { clientId, tenentId } = res.locals.jwtPayload;

        const jobOutput: JobOutput = await getJobOutputUseCase.getJobOutput({
          id: new JobId(parseInt(jobId)),
          clientIdentity: new ClientIdentity(clientId, tenentId)
        });

        res.status(StatusCodes.OK)
          .setHeader('Content-Type', jobOutput.mimetype)
          .setHeader('Content-Length', jobOutput.length)
          .write(jobOutput.base64Content);
        res.end();
      } catch (error) {
        if (error instanceof PTCError) {
          switch (error.name) {
            case PTCERROR_TYPE.WRONG_INPUT:
              res.status(StatusCodes.BAD_REQUEST).send((error as Error).message);
              break;
            case PTCERROR_TYPE.NOT_FOUND:
              res.status(StatusCodes.NOT_FOUND).send((error as Error).message);
              break;
            case PTCERROR_TYPE.NOT_AUTHORIZED:
              res.status(StatusCodes.UNAUTHORIZED).send((error as Error).message);
              break;
            case PTCERROR_TYPE.FORBIDDEN:
              res.status(StatusCodes.FORBIDDEN).send((error as Error).message);
              break;
            case PTCERROR_TYPE.EXT_SERVICE_ERROR:
              res.status(StatusCodes.SERVICE_UNAVAILABLE).send((error as Error).message);
              break;
            case PTCERROR_TYPE.EXT_SERVICE_ERROR:
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as Error).message);
              break;
          }
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send((error as Error).message);
        }
      }
    };
  }
}