import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the authenticated admin user from the request.
 *
 * Usage:
 *   @AdminCurrentUser() admin: AdminJwtPayload     // entire payload
 *   @AdminCurrentUser('id') adminId: string         // specific field
 */
export const AdminCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const adminUser = request.adminUser;
    return data ? adminUser?.[data] : adminUser;
  },
);
