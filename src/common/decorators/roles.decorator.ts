import { SetMetadata } from '@nestjs/common';
import { RoleTypes } from 'src/DB/model/User.model';

export const rolesKey: string = 'roles';
export const Roles = (data: RoleTypes[]) => {
  return SetMetadata(rolesKey, data);
};
