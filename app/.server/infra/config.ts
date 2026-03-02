import { z } from "zod";

const _config = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),

  PORT: z.coerce.number().default(8080),
  ENV: z.enum(["local", "dev", "stg", "prd"]),
});
export type Config = z.infer<typeof _config>;

export let config: Config;

export function initConfig() {
  config = _config.parse(process.env);
}
