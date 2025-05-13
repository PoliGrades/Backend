import { ZodSchema } from "zod";

export function validateData(schema: ZodSchema) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        await schema.safeParseAsync(args[0]);

        return originalMethod.apply(this, [args[0], args[1]]);
      } catch (error) {
        throw new Error(`Validation failed: ${error}`);
      }
    };
  };
}
