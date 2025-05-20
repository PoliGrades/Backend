import { ZodError, ZodSchema } from "zod";

export function validateData(schema: ZodSchema) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      try {
        await schema.parseAsync(args[0]);

        return originalMethod.apply(this, [args[0], args[1]]);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ZodError(error.issues);
        }
      }
    };
  };
}