import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate a timeout by waiting longer than the client timeout
  await new Promise(resolve => setTimeout(resolve, 10000))
  
  return NextResponse.json({ message: 'This should not be reached' })
}
