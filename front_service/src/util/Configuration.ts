import { default as path } from 'path';
import { default as dotenv } from 'dotenv';
import { Provider } from 'nconf';
import { default as Joi, ValidationResult } from 'joi';

export type HTTPServerConf = {
  PORT: number;
};

export type DatabaseConf = {
  DIALECT: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  NAME: string;
  USERNAME: string;
  PASSWORD: string;
  HOST: string;
  PORT: number;
};

export type JwtConf = {
  CLIENT_ID: string;
}

const httpConfSchema = Joi.object({
  PORT: Joi.number().required()
}).required();

const databaseConfSchema = Joi.object({
  NAME: Joi.string().required(),
  USERNAME: Joi.string().required(),
  PASSWORD: Joi.string().required()
}).required();

const jwtConfSchema = Joi.object({
  CLIENT_ID: Joi.string().required()
}).required();

export class Configuration {
  private static _instance?: Configuration;
  private static httpServerConfKey = 'HTTP';
  private static databaseConfKey = 'DATABASE';
  private static jwtConfKey ='JWT';
  readonly httpServerConf: HTTPServerConf;
  private _databaseConf: DatabaseConf;
  readonly jwtConf: JwtConf;

  private constructor(httpServerConf: HTTPServerConf, databaseConf: DatabaseConf, jwtConf: JwtConf) {
    this.httpServerConf = httpServerConf;
    this._databaseConf = databaseConf;
    this.jwtConf = jwtConf;
  }

  static getInstance(): Configuration {
    if (!Configuration._instance) {
      /* default env file is:
         ./ivre.<NODE_ENV>.env if NODE_ENV env variable is set
         ./ivre.env otherwise */
      const confFileName = path.join(
        (global as any).__basedir,
        process.env.NODE_ENV ? `ivre.${process.env.NODE_ENV}.env` : 'ivre.env'
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
      const databaseConf: DatabaseConf = Configuration.validateDatabaseConf(nconf.get(Configuration.databaseConfKey));

      const jwtConf: JwtConf = Configuration.validateJwtConf(nconf.get(Configuration.jwtConfKey));

      Configuration._instance = new Configuration(httpServerConf, databaseConf, jwtConf);
    }
    return Configuration._instance;
  }

  private static validateHTTPServerConf(httpServerConf: any): HTTPServerConf {
    const res: ValidationResult = httpConfSchema.validate(httpServerConf);
    if (res.error) {
      throw new Error(`HTTPServerConf validation error: ${JSON.stringify(res.error.details)}`);
    }
    return res.value as HTTPServerConf;
  }

  private static validateDatabaseConf(databaseConf: any): DatabaseConf {
    const res: ValidationResult = databaseConfSchema.validate(databaseConf);
    if (res.error) {
      throw new Error(`DatabaseConf validation error: ${JSON.stringify(res.error.details)}`);
    }
    return res.value as DatabaseConf;
  }

  private static validateJwtConf(jwtConf: any): JwtConf {
    const res: ValidationResult = jwtConfSchema.validate(jwtConf);
    if (res.error) {
      throw new Error(`JwtConf validation error: ${JSON.stringify(res.error.details)}`);
    }
    return res.value as JwtConf;
  }

  get databaseConf(): DatabaseConf {
    return { ...this._databaseConf, DIALECT: 'postgres', HOST: 'localhost', PORT: 5432 };
  }
}
