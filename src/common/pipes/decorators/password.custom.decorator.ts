import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  MinLength,
} from 'class-validator';

@ValidatorConstraint({ name: 'match-password ', async: false })
export class IsMatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    console.log({ value, args });

    return args.object[args.constraints[0]] == value;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'password misMatch c-password';
  }
}
export function IsMatchPassword(
  matchWith: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [matchWith],
      validator: IsMatchPasswordConstraint,
    });
  };
}
