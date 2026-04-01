import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match: /, /en/..., /bn/..., AND bare paths like /billing, /settings, /dashboard
  matcher: ['/((?!_next|.*\..*).*)'],
};
