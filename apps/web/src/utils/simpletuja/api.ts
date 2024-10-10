import axios, { AxiosRequestConfig } from "axios";
import { LocalStorageKey } from "../const";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

export const apiRequest = async <T>(
  url: string,
  data?: unknown,
  includeToken: boolean = true
): Promise<T> => {
  const headers: AxiosRequestConfig["headers"] = {};

  if (includeToken) {
    const token = localStorage.getItem(LocalStorageKey.AccessToken);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await apiClient.request<T>({
    url,
    method: "POST",
    data,
    headers,
  });
  return response.data;
};
