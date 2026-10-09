import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return gateway status message', () => {
      const response = appController.getRoot();
      expect(response.status).toBe('ok');
      expect(response.message).toBe('Portfolio API Gateway is running');
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('health', () => {
    it('should return healthy status', () => {
      const response = appController.getHealth();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('api-gateway');
      expect(response.timestamp).toBeDefined();
    });
  });
});
