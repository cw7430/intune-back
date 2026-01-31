import 'fastify';
import { AuthenticatedUser } from '@/common/auth/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
