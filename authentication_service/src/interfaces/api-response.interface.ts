import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  code: HttpStatus;
  message: string;
  data?: T;
}
