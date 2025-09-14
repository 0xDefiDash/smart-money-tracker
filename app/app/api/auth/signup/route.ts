
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, email, name } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check if username already exists (only check if username is not null)
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: username,
        NOT: {
          username: null
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Also check if email exists and has a username (to prevent duplicate accounts)
    if (email) {
      const existingEmailUser = await prisma.user.findFirst({
        where: { 
          email: email,
          username: {
            not: null
          }
        }
      })

      if (existingEmailUser) {
        return NextResponse.json(
          { error: 'Email already registered with an account' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with all required fields
    const newUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        email: email || null,
        name: name || username,
        gameCoins: 1000,
        gameLevel: 1,
        gameExp: 0,
        isAdmin: false
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email
      }
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
