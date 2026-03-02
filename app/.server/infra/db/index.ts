import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config.js";
import { Prisma, PrismaClient } from "./gen/client.js";

export let prisma: PrismaClient;

export function initDatabase() {
  const dbHost = config.DATABASE_HOST;
  const dbPort = config.DATABASE_PORT;
  const dbUser = config.DATABASE_USER;
  const dbPassword = config.DATABASE_PASSWORD;
  const dbName = config.DATABASE_NAME;

  const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
}

export function isNotFoundError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError)
    return e.code === "P2025";
  return false;
}

export function isAlreadyExistError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError)
    return e.code === "P2002";
  return false;
}

export function isForeignKeyConstraintError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError)
    return e.code === "P2003";
  return false;
}

export * from "./gen/client.js";
