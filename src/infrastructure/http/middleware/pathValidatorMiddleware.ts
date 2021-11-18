import { ValidationResult, AnySchema } from 'joi';
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../../util/Logger';

export const pathValidatorMiddleware = (schema: AnySchema, paramKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validationRes: ValidationResult = schema.validate(req.params[paramKey]);
    if (validationRes.error) {
      Logger.debug(`Params validation result for request ${req.url}: ${JSON.stringify(validationRes)}`);
      res.status(StatusCodes.BAD_REQUEST).send(`Wrong path, ${paramKey}: ${validationRes.error.message}`);
    } else {
      next();
    }
  };
}