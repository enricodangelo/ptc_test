import express from 'express';

export function postJobHandler(req: express.Request, res: express.Response) {
  res.sendStatus(StatusCodes.OK);
}

export function getJobStatusHandler(req: express.Request, res: express.Response) {
  res.sendStatus(StatusCodes.OK);
}

export function getJobOutputHandler(req: express.Request, res: express.Response) {
  res.sendStatus(StatusCodes.OK);
}