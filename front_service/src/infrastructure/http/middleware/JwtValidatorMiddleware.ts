import { Request, Response, NextFunction } from "express";
import { StatusCodes } from 'http-status-codes';
import * as jwt from "jsonwebtoken";
import { Configuration } from "../../../util/Configuration";
import { Logger } from "../../../util/Logger";

export const jwtValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // check token presence
  const authHeader: string | string[] | undefined = <string>req.headers['authorization'];
  const token = authHeader && authHeader.split('Bearer ')[1]  // bearer token
  Logger.log(`Brearer token from request: ${token}`);

  if (!token) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }
  // token validation
  try {
    // should call verify instead of decode to actually validate the token
    const jwtPayload: any = jwt.decode(token);
    Logger.log(`Decoded jwt token from request: ${JSON.stringify(jwtPayload)}`);
    if (Configuration.getInstance().jwtConf.CLIENT_ID !== jwtPayload.azp) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
    res.locals.jwtPayload = jwtPayload;
    Logger.log(`Brearer token ok`);
  } catch (error) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  next();
};