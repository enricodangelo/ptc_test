import { ValidationResult, AnySchema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../../util/Logger';

export const inputValidatorMiddleware = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validationRes: ValidationResult = schema.validate(req.body);
    if (validationRes.error) {
      Logger.debug(`Input validation result for request ${req.url}: ${JSON.stringify(validationRes)}`);
      res.status(StatusCodes.BAD_REQUEST).send(validationRes.error.message);
    } else {
      next();
    }
  };
};
