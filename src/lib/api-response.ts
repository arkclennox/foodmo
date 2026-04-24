import { NextResponse } from 'next/server';

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function apiSuccess<T>(data: T, init?: { status?: number }) {
  return NextResponse.json({ success: true, data }, { status: init?.status ?? 200 });
}

export function apiError(
  error: ApiError,
  init?: { status?: number },
) {
  return NextResponse.json(
    { success: false, error },
    { status: init?.status ?? 400 },
  );
}

export const ERR = {
  unauthorized: (message = 'Unauthorized') =>
    apiError({ code: 'UNAUTHORIZED', message }, { status: 401 }),
  forbidden: (message = 'Forbidden') =>
    apiError({ code: 'FORBIDDEN', message }, { status: 403 }),
  notFound: (message = 'Not found') =>
    apiError({ code: 'NOT_FOUND', message }, { status: 404 }),
  validation: (message: string, details?: unknown) =>
    apiError({ code: 'VALIDATION_ERROR', message, details }, { status: 422 }),
  conflict: (message: string) =>
    apiError({ code: 'CONFLICT', message }, { status: 409 }),
  server: (message = 'Internal server error') =>
    apiError({ code: 'SERVER_ERROR', message }, { status: 500 }),
};
