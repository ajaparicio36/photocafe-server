import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://click-click-popup.ajaparicio.com",
  "https://click-click.ajaparicio.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

const ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization";

function setCorsHeaders(
  response: NextResponse,
  origin: string | null,
): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    return setCorsHeaders(response, origin);
  }

  const response = NextResponse.next();
  return setCorsHeaders(response, origin);
}

export const config = {
  matcher: "/api/:path*",
};
