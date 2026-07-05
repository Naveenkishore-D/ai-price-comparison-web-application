/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from "axios";
import { Product, SearchHistoryItem, AIRecommendResponse } from "../types";

// Base API URL
const API_URL = "/api";

// Create Axios client instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor to automatically append the Bearer Token if logged in
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Type-safe API client utilities for the application.
 */
export const api = {
  /**
   * Register a new user account.
   */
  async register(name: string, email: string, password: string) {
    const response = await apiClient.post("/auth/register", { name, email, password });
    return response.data;
  },

  /**
   * Authenticate user credentials and return JWT token + user details.
   */
  async login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logs out the user by clearing credentials from localStorage.
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Retrieves user details of current authenticated session.
   */
  async getProfile() {
    const response = await apiClient.get("/user/profile");
    return response.data;
  },

  /**
   * Query product inventory by keyword. Records query in history automatically if logged in.
   */
  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Retrieve side-by-side specifications for selected product IDs.
   */
  async compareProducts(ids: string[]): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/compare?ids=${ids.join(",")}`);
    return response.data;
  },

  /**
   * Requests a detailed recommendation breakdown powered by Gemini AI.
   */
  async getAIRecommendation(productIds: string[], userPreference: string): Promise<AIRecommendResponse> {
    const response = await apiClient.post<AIRecommendResponse>("/products/ai-recommend", {
      productIds,
      userPreference,
    });
    return response.data;
  },

  /**
   * Scan product screenshot or receipt using Gemini multimodal scanning.
   */
  async scanFile(fileData: string, mimeType: string, fileName: string) {
    const response = await apiClient.post("/products/scan-file", {
      fileData,
      mimeType,
      fileName,
    });
    return response.data;
  },

  /**
   * Fetch current user's past search histories.
   */
  async getUserHistory(): Promise<SearchHistoryItem[]> {
    const response = await apiClient.get<SearchHistoryItem[]>("/user/history");
    return response.data;
  },

  /**
   * Clear user's recorded search history log.
   */
  async clearUserHistory() {
    const response = await apiClient.delete("/user/history");
    return response.data;
  },
};
