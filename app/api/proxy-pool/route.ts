import { NextRequest, NextResponse } from 'next/server'
import { ServerProxyStorage } from '@/utils/serverProxyStorage'
import { SimpleProxy as Proxy } from '@/types/proxy'

// Get proxy storage instance
function getProxyStorage(): ServerProxyStorage {
  return ServerProxyStorage.getInstance()
}

// GET - Get all proxies or specific proxy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    const country = searchParams.get('country')
    const status = searchParams.get('status')

    const storage = getProxyStorage()

    if (id) {
      const proxy = storage.getProxy(parseInt(id))
      if (!proxy) {
        return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
      }
      return NextResponse.json(proxy)
    }

    let proxies = storage.getAllProxies()

    if (type) {
      proxies = proxies.filter(p => p.type === type)
    }

    if (country) {
      proxies = proxies.filter(p => p.country === country)
    }

    if (status) {
      proxies = proxies.filter(p => p.status === status)
    }

    return NextResponse.json(proxies)
  } catch (error) {
    console.error('GET /api/proxy-pool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add proxy or proxies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const storage = getProxyStorage()

    // Check if this is an import request
    if (body.data && body.format) {
      const proxies = await storage.importData(body.data, body.format)
      return NextResponse.json({ 
        message: `Imported ${proxies.length} proxies`, 
        proxies 
      })
    }

    if (Array.isArray(body)) {
      // Add multiple proxies
      const proxies = await storage.addProxies(body)
      return NextResponse.json({ message: `Added ${proxies.length} proxies`, proxies })
    } else {
      // Add single proxy
      const proxy = await storage.addProxy(body)
      return NextResponse.json({ message: 'Proxy added', proxy })
    }
  } catch (error) {
    console.error('POST /api/proxy-pool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update proxy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Proxy ID is required' }, { status: 400 })
    }

    const storage = getProxyStorage()
    const updatedProxy = await storage.updateProxy(id, updates)

    if (!updatedProxy) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Proxy updated', proxy: updatedProxy })
  } catch (error) {
    console.error('PUT /api/proxy-pool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove proxy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Proxy ID is required' }, { status: 400 })
    }

    const storage = getProxyStorage()
    const deleted = await storage.deleteProxy(parseInt(id))

    if (!deleted) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Proxy removed' })
  } catch (error) {
    console.error('DELETE /api/proxy-pool error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
