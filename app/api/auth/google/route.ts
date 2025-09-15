import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://proxymanagerapp.netlify.app'
      return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://proxymanagerapp.netlify.app'}/api/auth/google`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://proxymanagerapp.netlify.app'
      return NextResponse.redirect(`${baseUrl}/login?error=token_failed`)
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: userData.email,
        name: userData.name,
        picture: userData.picture
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Redirect to homepage with token and user data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://proxymanagerapp.netlify.app'
    const redirectUrl = new URL(baseUrl)
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      picture: userData.picture
    }))

    return NextResponse.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Google OAuth error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://proxymanagerapp.netlify.app'
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
  }
}
