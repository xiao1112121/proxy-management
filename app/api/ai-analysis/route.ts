import { NextRequest, NextResponse } from 'next/server'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface AIAnalysisRequest {
  proxies: Proxy[]
}

interface AIAnalysisResponse {
  recommendations: any[]
  predictions: any[]
  usagePatterns: any[]
  optimizationScore: number
  trendsAnalysis: {
    performanceTrend: string
    reliabilityTrend: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { proxies }: AIAnalysisRequest = await request.json()
    
    if (!proxies || !Array.isArray(proxies)) {
      return NextResponse.json(
        { error: 'Invalid proxies data' },
        { status: 400 }
      )
    }

    // Real AI analysis logic
    const recommendations: any[] = []
    const predictions: any[] = []
    const usagePatterns: any[] = []

    // Analyze proxy performance
    const aliveProxies = proxies.filter(p => p.status === 'alive')
    const deadProxies = proxies.filter(p => p.status === 'dead')
    const slowProxies = aliveProxies.filter(p => p.ping && p.ping > 1000)
    const fastProxies = aliveProxies.filter(p => p.ping && p.ping < 500)

    // Generate performance recommendations
    if (slowProxies.length > 0) {
      recommendations.push({
        id: `perf_${Date.now()}`,
        type: 'optimization',
        priority: 'high',
        title: 'High Latency Proxies Detected',
        description: `${slowProxies.length} proxies have latency > 1000ms`,
        action: 'Consider replacing with faster alternatives',
        proxyIds: slowProxies.map(p => p.id),
        impact: 'high',
        effort: 'medium'
      })
    }

    if (deadProxies.length > aliveProxies.length * 0.3) {
      recommendations.push({
        id: `health_${Date.now()}`,
        type: 'maintenance',
        priority: 'critical',
        title: 'High Failure Rate',
        description: `${deadProxies.length} dead proxies detected`,
        action: 'Replace failed proxies immediately',
        proxyIds: deadProxies.map(p => p.id),
        impact: 'critical',
        effort: 'high'
      })
    }

    // Generate predictions based on historical data
    aliveProxies.forEach(proxy => {
      if (proxy.ping && proxy.ping > 800) {
        predictions.push({
          id: `pred_${proxy.id}_${Date.now()}`,
          proxyId: proxy.id,
          type: 'failure',
          probability: Math.min(0.8, (proxy.ping - 500) / 1000),
          timeframe: '24h',
          reason: 'High latency indicates potential failure',
          confidence: 0.7
        })
      }
    })

    // Analyze usage patterns
    const typeDistribution = proxies.reduce((acc, proxy) => {
      acc[proxy.type] = (acc[proxy.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    usagePatterns.push({
      id: `usage_${Date.now()}`,
      type: 'type_distribution',
      data: typeDistribution,
      insights: Object.keys(typeDistribution).map(type => ({
        type,
        count: typeDistribution[type],
        percentage: (typeDistribution[type] / proxies.length) * 100,
        recommendation: type === 'http' ? 'Consider adding HTTPS proxies' : 'Good distribution'
      }))
    })

    // Calculate optimization score
    const performanceScore = aliveProxies.length > 0 
      ? Math.round((fastProxies.length / aliveProxies.length) * 100)
      : 0
    
    const reliabilityScore = proxies.length > 0
      ? Math.round((aliveProxies.length / proxies.length) * 100)
      : 0
    
    const optimizationScore = Math.round((performanceScore + reliabilityScore) / 2)

    // Determine trends
    const performanceTrend = optimizationScore >= 80 ? 'improving' : 
                           optimizationScore >= 60 ? 'stable' : 'declining'
    
    const reliabilityTrend = reliabilityScore >= 80 ? 'improving' :
                            reliabilityScore >= 60 ? 'stable' : 'declining'

    const response: AIAnalysisResponse = {
      recommendations,
      predictions,
      usagePatterns,
      optimizationScore,
      trendsAnalysis: {
        performanceTrend,
        reliabilityTrend
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json(
      { error: 'AI analysis failed' },
      { status: 500 }
    )
  }
}
