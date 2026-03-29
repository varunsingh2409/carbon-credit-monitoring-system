import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "carbon-credit-auth";
const TOKEN_STORAGE_KEY = "carbon-credit-token";

const syncToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => {
        syncToken(token);
        set({
          user,
          token,
          isAuthenticated: true
        });
      },
      logout: () => {
        syncToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<AuthState> | undefined) ?? {};
        const token = persisted.token ?? currentState.token;
        const user = persisted.user ?? currentState.user;

        syncToken(token ?? null);

        return {
          ...currentState,
          ...persisted,
          token: token ?? null,
          user: user ?? null,
          isAuthenticated: Boolean(token && user)
        };
      }
    }
  )
);
