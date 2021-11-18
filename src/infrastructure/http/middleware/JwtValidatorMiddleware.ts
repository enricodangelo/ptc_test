import { Request, Response, NextFunction } from "express";
import { StatusCodes } from 'http-status-codes';
import * as jwt from "jsonwebtoken";
import { Configuration } from "../../../util/Configuration";
import { Logger } from "../../../util/Logger";

export const jwtValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // check token presence
  const authHeader: string | string[] | undefined = <string>req.headers['authorization'];
  const token = authHeader && authHeader.split('Bearer ')[1]  // bearer token
  Logger.debug(`Brearer token from request: ${token}`);

  if (!token) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }
  // token validation
  try {
    // should call verify instead of decode to actually validate the token
    const jwtPayload: any = jwt.decode(token);
    Logger.debug(`Decoded jwt token from request: ${JSON.stringify(jwtPayload)}`);

    // simple check for audience in jwt token
    let audiences: string | string[] = jwtPayload.aud;
    if (!(audiences instanceof Array)) {
      audiences = [audiences];
    }
    let audienceMatchs: boolean = false;
    for (const audience of audiences) {
      if (Configuration.getInstance().jwtConf.AUDIENCE === jwtPayload.aud) {
        audienceMatchs = true;
      }
    }
    if (!audienceMatchs) {
      res.status(StatusCodes.FORBIDDEN).send('Wrong audience');
      return;
    }

    res.locals.jwtPayload = jwtPayload;
    Logger.debug(`Brearer token ok`);
  } catch (error) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  next();
};