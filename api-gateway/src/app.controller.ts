import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'Portfolio API Gateway is running',
      timestamp: new Date().toISOString(),
    };
  }
}
