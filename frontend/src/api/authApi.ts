import { apiClient } from "@/api/axiosConfig";
import { isPublishedDemoMode } from "@/demo/demoMode";
import { demoBackend } from "@/demo/mockBackend";
import type { LoginInput, TokenResponse, User, UserCreateInput } from "@/types";

type ApiUser = Omit<User, "name"> & {
  name?: string;
};

type ApiTokenResponse = Omit<TokenResponse, "user"> & {
  user: ApiUser;
};

const normalizeUser = (user: ApiUser): User => ({
  user_id: user.user_id,
  username: user.username,
  name: user.name?.trim() || user.username,
  role: user.role,
  email: user.email,
  created_at: user.created_at
});

export async function register(userData: UserCreateInput) {
  if (isPublishedDemoMode) {
    return demoBackend.register(userData);
  }

  const { data } = await apiClient.post<ApiUser>("/auth/register", userData);
  return normalizeUser(data);
}

export async function login(username: string, password: string) {
  if (isPublishedDemoMode) {
    return demoBackend.login(username, password);
  }

  const payload: LoginInput = { username, password };
  const { data } = await apiClient.post<ApiTokenResponse>("/auth/login", payload);

  return {
    ...data,
    user: normalizeUser(data.user)
  };
}

export async function getCurrentUser() {
  if (isPublishedDemoMode) {
    return demoBackend.getCurrentUser();
  }

  const { data } = await apiClient.get<ApiUser>("/auth/me");
  return normalizeUser(data);
}

export const authApi = {
  register,
  login,
  getCurrentUser
};
