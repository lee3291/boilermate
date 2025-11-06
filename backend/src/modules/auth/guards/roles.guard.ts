import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // If no roles are required, grant access
    }
    const { user } = context.switchToHttp().getRequest();

    // Ensure user and user.role exists
    if (!user || !user.role) {
      return false; // If user or role is not present, deny access
    }

    // Check if the user's role is one of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
