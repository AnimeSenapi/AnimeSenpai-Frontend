import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate a 500 error
  return NextResponse.json(
    { 
      error: 'Internal Server Error',
      message: 'This is a test error for error boundary testing',
      code: 'INTERNAL_SERVER_ERROR'
    },
    { status: 500 }
  )
}

export async function POST() {
  // Simulate a 400 error
  return NextResponse.json(
    { 
      error: 'Bad Request',
      message: 'Invalid request data',
      code: 'VALIDATION_ERROR'
    },
    { status: 400 }
  )
}
