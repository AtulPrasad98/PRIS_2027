import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getSharedWorkspaceUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await getSharedWorkspaceUser();
  } catch (error) {
    // Public mode remains usable for previews and health checks even when the
    // database is unavailable. Data operations still report DB errors.
    console.warn("[Public workspace] Falling back to an in-memory identity:", error);
    user = {
      id: 1,
      openId: "public-workspace",
      name: "PRIS Shared Workspace",
      email: null,
      loginMethod: "public",
      role: "admin",
      createdAt: new Date(0),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
