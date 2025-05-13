// Updated middleware with role-based dashboard redirection
import JwtDecode from 'jwt-decode'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define interface for JWT token payload
interface JwtPayload {
    id: string
    email: string
    role: string
    iat: number
    exp: number
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for api routes, static files, etc.
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Get auth token from cookies or headers
    const authToken = request.cookies.get('authToken')?.value
    
    // Get cookies for selected languages and sections
    const selectedLanguagesCookie = request.cookies.get('selectedLanguages')
    const selectedSectionsCookie = request.cookies.get('selectedSections')

    // Check if cookies exist and have valid content
    let hasValidSelections = false
    
    try {
        // Only proceed with validation if both cookies exist
        if (selectedLanguagesCookie?.value && selectedSectionsCookie?.value) {
            const languages = JSON.parse(selectedLanguagesCookie.value)
            const sections = JSON.parse(selectedSectionsCookie.value)
            
            hasValidSelections = 
                Array.isArray(languages) && 
                Array.isArray(sections) && 
                languages.length > 0 && 
                sections.length > 0
        }
    } catch (error) {
        // If JSON parsing fails, consider selections invalid
        hasValidSelections = false
    }

    // If user is at the root path, redirect based on selections
    if (pathname === '/') {
        if (hasValidSelections) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/websiteConfiguration', request.url))
        }
    }

    // If user is trying to access dashboard without valid selections, redirect to configuration
    if (pathname.startsWith('/dashboard') && !hasValidSelections && pathname !== '/dashboard/user') {
        return NextResponse.redirect(new URL('/websiteConfiguration', request.url))
    }

    // If user is directly accessing the main dashboard path, redirect based on role
    if (pathname === '/dashboard' && authToken) {
        try {
            // Decode JWT token to get user role
            const decoded = JwtDecode<JwtPayload>(authToken)
            const userRole = decoded.role.toLowerCase()

            // Redirect based on role
            if (userRole === 'admin' || userRole === 'user') {
                return NextResponse.redirect(new URL('/dashboard/user', request.url))
            }
            // Owner and SuperAdmin can access the main dashboard
            else if (userRole === 'owner' || userRole === 'superAdmin') {
                return NextResponse.next()
            }
        } catch (error) {
            // If token decoding fails, proceed to next middleware
            console.error('Token decoding error:', error)
        }
    }

    return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}