import { default as Joi, ValidationResult } from 'joi';

export const JobInputSchema = Joi.object({
  encoding: Joi.string().valid('base64').required(),
  MD5: Joi.string().required(),
  content: Joi.string().required(),
  mimetype: Joi.string().valid('image/jpeg', 'image/png').required()
}).required();

export const JobIDParamSchema = Joi.number().required();
