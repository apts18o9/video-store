import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home"
])


const isApiRoute = createRouteMatcher([
    "/api/videos"
])


 export default clerkMiddleware((auth, req)=> {
    const {userId} = auth();
    const currentUrl = new URL(req.url)
    const isAccessingDashboard = currentUrl.pathname === "/home"
    const isApiRequest = currentUrl.pathname.startsWith("/api")


    //if loggedIn
    if( userId && isPublicRoute(req) && !isAccessingDashboard){
        return NextResponse.redirect(new URL("/home", req.url))
    }

    if(!userId){
        //if not loggedIn & trying to access protected api

        if(!isApiRoute(req) && !isPublicRoute(req)){
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }

        //if req is for protected api and not logged in

        if(isApiRequest && !isPublicRoute(req)){
            return NextResponse.redirect(new URL("/sign-in", req.url))
        }
    }
 
    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
  };