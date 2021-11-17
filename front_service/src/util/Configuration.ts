import { default as path } from 'path';
import { default as dotenv } from 'dotenv';
import { Provider } from 'nconf';
import { default as Joi, ValidationResult } from 'joi';

export type HTTPServerConf = {
  PORT: number;
};

export type JwtConf = {
  CLIENT_ID: string;
}

const httpServerConfSchema = Joi.object({
  PORT: Joi.number().required()
}).required();

const jwtConfSchema = Joi.object({
  CLIENT_ID: Joi.string().required()
}).required();

export class Configuration {
  private static _instance?: Configuration;
  private static httpServerConfKey = 'HTTP';
  private static jwtConfKey = 'JWT';
  readonly httpServerConf: HTTPServerConf;
  readonly jwtConf: JwtConf;

  private constructor(httpServerConf: HTTPServerConf, jwtConf: JwtConf) {
    this.httpServerConf = httpServerConf;
    this.jwtConf = jwtConf;
  }

  static getInstance(): Configuration {
    if (!Configuration._instance) {
      /* default env file is:
         ./ptc.<NODE_ENV>.env if NODE_ENV env variable is set
         ./ptc.env otherwise */
      const confFileName = path.join(
        (global as any).__basedir,
        process.env.NODE_ENV ? `ptc.${process.env.NODE_ENV}.env` : 'ptc.env'
      );
      /* Read configuration from file and set env variables accordingly
         Doesn't replace existing env variable with values from file */
      dotenv.config({ path: confFileName });
      const nconf = new Provider();
      /* get configuration from environment */
      nconf.env('__');

      const httpServerConf: HTTPServerConf = Configuration.validateHTTPServerConf(
        nconf.get(Configuration.httpServerConfKey)
      );

      const jwtConf: JwtConf = Configuration.validateJwtConf(nconf.get(Configuration.jwtConfKey));

      Configuration._instance = new Configuration(httpServerConf, jwtConf);
    }
    return Configuration._instance;
  }

  private static validateHTTPServerConf(httpServerConf: any): HTTPServerConf {
    const res: ValidationResult = httpServerConfSchema.validate(httpServerConf);
    if (res.error) {
      throw new Error(`HTTPServerConf validation error: ${JSON.stringify(res.error.details)}`);
    }
    return res.value as HTTPServerConf;
  }

  private static validateJwtConf(jwtConf: any): JwtConf {
    const res: ValidationResult = jwtConfSchema.validate(jwtConf);
    if (res.error) {
      throw new Error(`JwtConf validation error: ${JSON.stringify(res.error.details)}`);
    }
    return res.value as JwtConf;
  }
}
