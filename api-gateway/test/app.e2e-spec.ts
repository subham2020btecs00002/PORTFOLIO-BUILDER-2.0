process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890_abcdef';
process.env.INTERNAL_SECRET = 'test_internal_secret_token';

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(
    () => (req: any, res: any, next: any) => next(),
  ),
  fixRequestBody: jest.fn(() => () => {}),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBe('Portfolio API Gateway is running');
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('api-gateway');
  });
});
