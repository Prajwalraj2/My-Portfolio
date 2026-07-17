// import { NextRequest, NextResponse } from "next/server";

// const API_URL = process.env.API_URL || "http://localhost:8000";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ path: string[] }> }
// ) {
//   const { path } = await params;
//   const targetPath = `/api/${path.join("/")}`;
//   const targetUrl = `${API_URL}${targetPath}${request.nextUrl.search}`;

//   try {
//     const response = await fetch(targetUrl, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.error("Proxy GET error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch from backend" },
//       { status: 502 }
//     );
//   }
// }

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ path: string[] }> }
// ) {
//   const { path } = await params;
//   const targetPath = `/api/${path.join("/")}`;
//   const targetUrl = `${API_URL}${targetPath}`;

//   try {
//     const body = await request.json();

//     // Check if this is a streaming request (chat)
//     if (targetPath.includes("/chat/stream")) {
//       const response = await fetch(targetUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       });

//       if (!response.ok) {
//         return NextResponse.json(
//           { error: "Backend request failed" },
//           { status: response.status }
//         );
//       }

//       // Stream the response back
//       const stream = response.body;
//       if (!stream) {
//         return NextResponse.json(
//           { error: "No response body" },
//           { status: 502 }
//         );
//       }

//       return new NextResponse(stream, {
//         status: 200,
//         headers: {
//           "Content-Type": "text/event-stream",
//           "Cache-Control": "no-cache",
//           Connection: "keep-alive",
//         },
//       });
//     }

//     // Regular POST request
//     const response = await fetch(targetUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();
//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.error("Proxy POST error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch from backend" },
//       { status: 502 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ path: string[] }> }
// ) {
//   const { path } = await params;
//   const targetPath = `/api/${path.join("/")}`;
//   const targetUrl = `${API_URL}${targetPath}`;

//   try {
//     const body = await request.json();
//     const response = await fetch(targetUrl, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();
//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.error("Proxy PUT error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch from backend" },
//       { status: 502 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ path: string[] }> }
// ) {
//   const { path } = await params;
//   const targetPath = `/api/${path.join("/")}`;
//   const targetUrl = `${API_URL}${targetPath}`;

//   try {
//     const response = await fetch(targetUrl, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.status === 204) {
//       return new NextResponse(null, { status: 204 });
//     }

//     const data = await response.json();
//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.error("Proxy DELETE error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch from backend" },
//       { status: 502 }
//     );
//   }
// }




// By Claude 

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL;

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetUrl = `${API_URL}/${path.join("/")}`;

  // Forward query params
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

  // Forward headers (except host)
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key !== "host") headers.set(key, value);
  });

  // Forward the request
  const response = await fetch(fullUrl, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined,
    // @ts-expect-error - Next.js specific
    duplex: "half",
  });

  // Forward response headers
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;