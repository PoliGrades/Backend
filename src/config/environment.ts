export interface AppConfig {
  environment: string;
  uploadsDir: string;
  port: number;
  secretKey: string;
}

export function getConfig(): AppConfig {
  const env = Deno.env.toObject();

  if (!env.ENVIRONMENT) {
    throw new Error("ENVIRONMENT variable is not set");
  }

  if (!env.SECRET_KEY) {
    throw new Error("SECRET_KEY variable is not set");
  }

  return {
    environment: env.ENVIRONMENT,
    uploadsDir: env.UPLOADS_DIR || "./uploads",
    port: parseInt(env.PORT || "3000"),
    secretKey: env.SECRET_KEY,
  };
}
