import { Request, Response, NextFunction } from "express";
import { StatusCodes } from 'http-status-codes';
import * as jwt from "jsonwebtoken";
import { Configuration } from "../../../util/Configuration";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // check token presence
  const authHeader: string | string[] | undefined = <string>req.headers['authorization'];
  const token = authHeader && authHeader.split('Bearer ')[1]  // bearer token

  if (!token) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }
  // token validation
  try {
    // should call verify instead of decode to actually validate the token
    const jwtPayload: any = jwt.decode(token);
    if (Configuration.getInstance().jwtConf.CLIENT_ID !== jwtPayload.azp) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  next();
};