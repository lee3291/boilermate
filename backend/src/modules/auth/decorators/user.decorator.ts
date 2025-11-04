import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * A custom decorator to extract the user object from the request.
 * The user object is added to the request by the JwtStrategy's validate method.
 *
 * @example
 * ```
 * @UseGuards(AuthGuard('jwt'))
 * @Get('profile')
 * getProfile(@User() user: { userId: string; email: string }) {
 *   return user;
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
