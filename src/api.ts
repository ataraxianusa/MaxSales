/// <reference types="vite/client" />

/**
 * API base URL utility.
 *
 * In development, VITE_API_URL is empty → fetch("/api/...") goes to local Express server.
 * In production, VITE_API_URL points to the Cloudflare Worker URL.
 */
export const API_BASE: string = import.meta.env.VITE_API_URL || "";
