import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware();

// Match against pages that require auth
// Leave this out if you want auth on every resource (including images, css etc.)
export const config = { matcher: ['/:all*', '/api/:all*'] };