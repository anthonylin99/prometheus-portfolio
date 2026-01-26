// Visitor ID system — persistent anonymous identity for watchlist and submissions
// Uses localStorage on the client, passed as a header/cookie to API routes.

import { v4 as uuidv4 } from 'uuid';

const VISITOR_KEY = 'prometheus-visitor-id';

/**
 * Get or create a visitor ID from localStorage (client-side only).
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getVisitorId() can only be called on the client');
  }

  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/**
 * Extract visitor ID from request headers (server-side).
 * Checks X-Visitor-Id header first, then cookie.
 */
export function getVisitorIdFromRequest(request: Request): string | null {
  // Check header
  const header = request.headers.get('x-visitor-id');
  if (header && header.length > 0) return header;

  // Check cookie
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/prometheus-visitor-id=([^;]+)/);
  if (match) return match[1];

  return null;
}

/**
 * React hook-friendly getter. Returns null during SSR, resolves on client.
 */
export function useVisitorId(): string | null {
  if (typeof window === 'undefined') return null;
  return getVisitorId();
}
