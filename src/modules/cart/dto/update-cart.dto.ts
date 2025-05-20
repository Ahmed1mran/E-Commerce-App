import { Types } from 'mongoose';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

@ValidatorConstraint({ name: 'check_mongo_ids', async: false })
export class CheckMongoIds implements ValidatorConstraintInterface {
  validate(ids: Types.ObjectId[], _args: ValidationArguments) {
    for (const id of ids) {
      if (!Types.ObjectId.isValid(id)) {
        return false; // Invalid ObjectId
      }
    }
    return true; // All ObjectIds are valid
  }

  defaultMessage(_args: ValidationArguments) {

    return 'in-valid mongoIds';
  }
}
export class ItemIdsDto {
  @Validate(CheckMongoIds)
  productIds: Types.ObjectId[];
}
