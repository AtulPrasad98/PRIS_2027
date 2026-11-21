import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

const PUBLIC_WORKSPACE_USER = {
  id: 1,
  openId: "public-workspace",
  name: "PRIS Shared Workspace",
  email: null,
  loginMethod: "public",
  role: "admin" as const,
};

export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return useMemo(() => ({
    user: meQuery.data ?? PUBLIC_WORKSPACE_USER,
    loading: meQuery.isLoading,
    error: meQuery.error ?? null,
    isAuthenticated: true,
    refresh: () => meQuery.refetch(),
    // Retained as a compatibility no-op for legacy layout components. Public
    // mode intentionally has no session to terminate.
    logout: async () => undefined,
  }), [meQuery.data, meQuery.error, meQuery.isLoading, meQuery.refetch]);
}
