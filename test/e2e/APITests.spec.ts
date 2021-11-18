import { default as path } from 'path';
// import { fail } from 'assert';
import { default as supertestRequest } from 'supertest';
import { HTTPServerForTest } from '../../src/infrastructure/http/HTTPServerForTest';
import { Configuration } from '../../src/util/Configuration';
import { default as express } from 'express';
import { pngJobInput, validJWTToken } from './fixtures';
import { Server } from 'http';

/* save global variable "__basedir" to access project's root dir later in Configuration
   This works only if this file is located at the root of the project */
(global as any).__basedir = path.join(__dirname, '../');

let expressApp: express.Express;
let httpServer: Server;
const jobEndpoint = '/api/v1/job';

beforeAll(async () => {
  const configuration: Configuration = Configuration.getInstance();
  const res = await HTTPServerForTest.startForE2ETest(configuration.httpServerConf);
  expressApp = res.expressApp;
  httpServer = res.httpServer;
});

afterAll(async () => {
  if (httpServer) {
    httpServer.close();
  }
});

describe('API end-to-end tests', () => {
  test('POST /job', async () => {
    const res = await supertestRequest(expressApp)
      .post(jobEndpoint)
      .set('Authorization', `Bearer ${validJWTToken}`)
      .send(pngJobInput);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('status');
  });
});
