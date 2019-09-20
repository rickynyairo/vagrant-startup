import {
  validate,
  IsString,
  IsDefined,
  MinLength,
  IsAlphanumeric,
  ValidateNested
} from "class-validator";
interface Address {
  city: string;
  street: string;
}
export class PostValidator {
  @IsDefined({ message: "$property is required in the request" })
  @IsString({ message: "$property should be a string" })
  author!: string;

  @IsDefined({ message: "$property is required in the request" })
  @IsString({ message: "$property should be a string" })
  content!: string;

  @IsDefined({ message: "$property is required in the request" })
  @IsString({ message: "$property should be a string" })
  title!: string;
}

export class ModifyPostValidator {
  @IsString({ message: "$property should be a string" })
  author!: string;

  @IsString({ message: "$property should be a string" })
  content!: string;

  @IsString({ message: "$property should be a string" })
  title!: string;
}

export class LoginValidator {

  @IsDefined({ message: "$property is required in the request" })
  @IsString({ message: "$property should be a string" })
  @MinLength(4, { message: "$property should have atleast 4 characters" })
  username!: string;

  @IsDefined({ message: "$property is required in the request" })
  @IsAlphanumeric({ message: "$property should only have numbers and letters" })
  @MinLength(4, { message: "$property should have atleast 4 characters" })
  password!: string;
}
export class UserValidator extends LoginValidator {

  @IsDefined({ message: "$property is required in the request" })
  address!: Address;
}

const humanize = (message: string) => {
  const newMessage = message.replace(/_/g, " ");
  return newMessage.charAt(0).toUpperCase() + newMessage.slice(1);
};

const formatError = (error: any) => {
  const { property, constraints } = error;
  const messages: string[] = Object.values(
    constraints || { error: "check your request payload" }
  );

  return {
    [property]: messages.map(message => humanize(message))
  };
};
const message =
  "Your request is not properly formed. Please correct and try again";
/**
 * Validates a request using a validator class defined with decorators
 * @param {class} Validator the validator to use
 * @param {object} payload The request payload to be validated
 * @returns {object|boolean} the validation errors or false if none.
 */
export const validateRequest = async (
  validator: any,
  payload: any,
  skipMissingProperties = false
): Promise<boolean | any> => {
  const resource = new validator();
  let validationErrors = {};

  Object.entries(payload).forEach(([key, value]) => {
    resource[key] = value;
  });
  const errors = await validate(resource, {
    skipMissingProperties,
    validationError: { target: true },
    forbidUnknownValues: true
  });
  if (errors.length === 0) {
    return false;
  }

  /**
   * The errors object contains too many properties that are required
   * We are only interested in the field and the error messages
   */
  for (const error of errors) {
    validationErrors = {
      ...validationErrors,
      ...formatError(error)
    };
  }

  return {
    message,
    errors: validationErrors
  };
};
