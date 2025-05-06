// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;
//   const isPublicPath =
//     path === "/api/auth/signin" ||
//     path === "/api/auth/signout" ||
//     path === "/" ||
//     path === "/auth/login" ||
//     path === "/api/auth/callback/github";

//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   if (path.startsWith("/api/")) {
//     if (isPublicPath) {
//       return NextResponse.next();
//     }

//     if (!token) {
//       return new NextResponse(
//         JSON.stringify({ error: "Authentication required" }),
//         {
//           status: 401,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }

//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set("x-user-id", token.sub || "");
//     requestHeaders.set("x-user-email", token.email || "");
//     requestHeaders.set("x-user-accessToken", token.accessToken || "");
//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   }

//   if (isPublicPath && token) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   if (!isPublicPath && !token) {
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   return NextResponse.next();
// }

// // Configure which routes to run middleware on
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     "/((?!_next/static|_next/image|favicon.ico|public).*)",
//   ],
// };
