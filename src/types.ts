/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductReview {
  author: string;
  rating: number;
  text: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  amazonPrice: number;
  flipkartPrice: number;
  rating: number;
  imageUrl: string; // Used to determine visual category icon in React
  specs: Record<string, string>;
  reviews: ProductReview[];
}

export interface User {
  name: string;
  email: string;
}

export interface SearchHistoryItem {
  id: string;
  userEmail: string;
  query: string;
  timestamp: string;
}

export interface AIRecommendResponse {
  recommendation: string;
  bestValueId: string;
  premiumId: string;
  isFallback: boolean;
}
