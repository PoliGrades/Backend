// deno-lint-ignore-file no-explicit-any
export interface IHandlerReturn {
  status: number;
  message: string;
  data?: any;
  error?: string;
}
