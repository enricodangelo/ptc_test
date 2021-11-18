import { default as path } from 'path';
// import { fail } from 'assert';
import { default as supertestRequest } from 'supertest';
import { HTTPServerForTest } from '../../src/infrastructure/http/HTTPServerForTest';
import { Configuration } from '../../src/util/Configuration';
import { default as express } from 'express';
import {
  invalidAudienceJWTToken,
  jpgJobInput,
  pngJobInput,
  tiffJobInput,
  validJWTToken,
  validJWTTokenSecondUser
} from './fixtures';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';

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
  test('POST /job: submit a bunch of jobs', async () => {
    const nCreate = 10;
    for (let i = 0; i < nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .post(jobEndpoint)
        .set('Authorization', `Bearer ${validJWTToken}`)
        .send(pngJobInput);
      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');
    }
  });

  test('GET /job/:id/status: submit another bunch of jobs, retrieve their status, retrieve status of non-existing jobs', async () => {
    let startRetrieve = 0;
    const nCreate = 40;
    for (let i = 0; i < nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .post(jobEndpoint)
        .set('Authorization', `Bearer ${validJWTToken}`)
        .send(pngJobInput);
      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');

      if (i === 0) {
        // first run
        startRetrieve = res.body.id;
      }
    }

    for (let i = startRetrieve; i < startRetrieve + nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .get(`${jobEndpoint}/${i}/status`)
        .set('Authorization', `Bearer ${validJWTToken}`)
        .send();
      expect([StatusCodes.OK, StatusCodes.SERVICE_UNAVAILABLE]).toContain(res.statusCode);
      if (res.statusCode === StatusCodes.OK) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('status');
      }
    }

    const res = await supertestRequest(expressApp)
      .get(`${jobEndpoint}/${startRetrieve + nCreate}/status`)
      .set('Authorization', `Bearer ${validJWTToken}`)
      .send();
    expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  test('GET /job/:id/output: submit another bunch of jobs, retrieve their output, retrieve output of non-existing jobs', async () => {
    let startRetrieve = 0;
    const nCreate = 100;
    for (let i = 0; i < nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .post(jobEndpoint)
        .set('Authorization', `Bearer ${validJWTToken}`)
        .send(pngJobInput);
      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status');

      if (i === 0) {
        // first run
        startRetrieve = res.body.id;
      }
    }

    for (let i = startRetrieve; i < startRetrieve + nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .get(`${jobEndpoint}/${i}/output`)
        .set('Authorization', `Bearer ${validJWTToken}`)
        .send();
      expect([StatusCodes.OK, StatusCodes.NOT_FOUND, StatusCodes.SERVICE_UNAVAILABLE]).toContain(res.statusCode);
      if (res.statusCode === StatusCodes.OK) {
        expect(Buffer.isBuffer(res.body)).toBeTruthy();
      }
    }

    const res = await supertestRequest(expressApp)
      .get(`${jobEndpoint}/${startRetrieve + nCreate}/output`)
      .set('Authorization', `Bearer ${validJWTToken}`)
      .send();
    expect(res.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });

  test('POST /job: submit different images', async () => {
    // png
    const resPng = await supertestRequest(expressApp)
      .post(jobEndpoint)
      .set('Authorization', `Bearer ${validJWTToken}`)
      .send(pngJobInput);
    expect(resPng.statusCode).toEqual(StatusCodes.CREATED);
    expect(resPng.body).toHaveProperty('id');
    expect(resPng.body).toHaveProperty('status');

    // jpg
    const resJpg = await supertestRequest(expressApp)
      .post(jobEndpoint)
      .set('Authorization', `Bearer ${validJWTToken}`)
      .send(jpgJobInput);
    expect(resJpg.statusCode).toEqual(StatusCodes.CREATED);
    expect(resJpg.body).toHaveProperty('id');
    expect(resJpg.body).toHaveProperty('status');

    //tiff
    const resTiff = await supertestRequest(expressApp)
      .post(jobEndpoint)
      .set('Authorization', `Bearer ${validJWTToken}`)
      .send(tiffJobInput);
    expect(resTiff.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  test(`JWT token's audience MUST match the one configured in app`, async () => {
    const resCreate = await supertestRequest(expressApp)
      .post(jobEndpoint)
      .set('Authorization', `Bearer ${invalidAudienceJWTToken}`)
      .send(pngJobInput);
    expect(resCreate.statusCode).toEqual(StatusCodes.FORBIDDEN);

    const resGetStatus = await supertestRequest(expressApp)
      .get(`${jobEndpoint}/1/status`)
      .set('Authorization', `Bearer ${invalidAudienceJWTToken}`)
      .send();
    expect(resGetStatus.statusCode).toEqual(StatusCodes.FORBIDDEN);

    const resGetOutput = await supertestRequest(expressApp)
      .get(`${jobEndpoint}/1/output`)
      .set('Authorization', `Bearer ${invalidAudienceJWTToken}`)
      .send();
    expect(resGetOutput.statusCode).toEqual(StatusCodes.FORBIDDEN);
  });

  test(`APIs check JWK token for identity`, async () => {
    let startRetrieve = 0;
    const nCreate = 40;
    for (let i = 0; i < nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .post(jobEndpoint)
        .set('Authorization', `Bearer ${validJWTToken}`)
        .send(pngJobInput);
      expect(res.statusCode).toEqual(StatusCodes.CREATED);

      if (i === 0) {
        // first run
        startRetrieve = res.body.id;
      }
    }

    for (let i = startRetrieve; i < startRetrieve + nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .get(`${jobEndpoint}/${i}/status`)
        .set('Authorization', `Bearer ${validJWTTokenSecondUser}`)
        .send();
      expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    }

    for (let i = startRetrieve; i < startRetrieve + nCreate; i++) {
      const res = await supertestRequest(expressApp)
        .get(`${jobEndpoint}/${i}/output`)
        .set('Authorization', `Bearer ${validJWTTokenSecondUser}`)
        .send();
      expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    }
  });
});
