import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simulate fetching proxy statistics
    const stats = {
      total: 150,
      alive: 120,
      dead: 20,
      pending: 10,
      averagePing: 245,
      averageSpeed: 3200,
      successRate: 80,
      countries: {
        'Việt Nam': 45,
        'Singapore': 30,
        'Thái Lan': 25,
        'Malaysia': 20,
        'Indonesia': 15,
        'Mỹ': 10,
        'Anh': 5
      },
      types: {
        'http': 60,
        'https': 40,
        'socks4': 25,
        'socks5': 20,
        'residential': 35,
        'datacenter': 15
      },
      anonymity: {
        'elite': 40,
        'anonymous': 50,
        'transparent': 30
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch proxy statistics' },
      { status: 500 }
    )
  }
}