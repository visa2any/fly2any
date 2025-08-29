// Social Proof Widget System for Travel Bookings
// Implements psychological triggers: Social Proof, Scarcity, Authority, Urgency

'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Star, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Flame
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialProofData {
  type: 'booking' | 'viewing' | 'review' | 'price_drop' | 'availability'
  message: string
  count?: number
  location?: string
  userName?: string
  userImage?: string
  timestamp?: Date
  rating?: number
  urgency?: 'low' | 'medium' | 'high'
  route?: string
}

interface SocialProofWidgetProps {
  data: SocialProofData[]
  position?: 'floating' | 'inline' | 'header' | 'sidebar'
  autoRotate?: boolean
  showDismiss?: boolean
  className?: string
}

export function SocialProofWidget({ 
  data, 
  position = 'floating',
  autoRotate = true,
  showDismiss = true,
  className 
}: SocialProofWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)

  // Auto-rotate through social proof messages
  useEffect(() => {
    if (!autoRotate || data.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % data.length)
      setAnimationKey((prev: number) => prev + 1)
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [autoRotate, data.length])

  if (!isVisible || data.length === 0) return null

  const currentProof = data[currentIndex]

  const getIconByType = (type: string) => {
    switch (type) {
      case 'booking':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'viewing':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'price_drop':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'availability':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800'
      case 'medium':
        return 'border-orange-200 bg-orange-50 text-orange-800'
      case 'low':
        return 'border-green-200 bg-green-50 text-green-800'
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800'
    }
  }

  const formatTimeAgo = (timestamp?: Date) => {
    if (!timestamp) return 'just now'
    
    const now = new Date()
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  const positionClasses = {
    floating: "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50",
    inline: "w-full",
    header: "w-full",
    sidebar: "w-full"
  }

  return (
    <Card 
      key={animationKey}
      className={cn(
        "shadow-lg border-2 transition-all duration-500 animate-in slide-in-from-bottom-2",
        getUrgencyColor(currentProof.urgency),
        positionClasses[position],
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* User Avatar (if applicable) */}
            {currentProof.userName && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={currentProof.userImage} />
                <AvatarFallback className="text-xs">
                  {currentProof.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIconByType(currentProof.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium leading-tight pr-2">
                  {currentProof.message}
                </p>
                
                {currentProof.urgency === 'high' && (
                  <Flame className="h-4 w-4 text-red-500 flex-shrink-0 animate-pulse" />
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                {currentProof.location && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {currentProof.location}
                  </span>
                )}
                
                {currentProof.timestamp && (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeAgo(currentProof.timestamp)}
                  </span>
                )}
                
                {currentProof.rating && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{currentProof.rating}/5</span>
                  </div>
                )}
              </div>

              {/* Route/Count Info */}
              {(currentProof.route || currentProof.count) && (
                <div className="mt-2">
                  {currentProof.route && (
                    <Badge variant="secondary" className="text-xs mr-2">
                      {currentProof.route}
                    </Badge>
                  )}
                  
                  {currentProof.count && currentProof.count > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {currentProof.count} people
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dismiss Button */}
          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-white/50"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specific Social Proof Components for Different Scenarios
export function BookingNotification({ booking }: { booking: any }) {
  const proofData: SocialProofData[] = [{
    type: 'booking',
    message: `${booking.userName || 'Someone'} just booked a flight from ${booking.origin} to ${booking.destination}`,
    location: booking.userLocation,
    timestamp: new Date(),
    urgency: 'medium',
    route: `${booking.origin} → ${booking.destination}`
  }]

  return <SocialProofWidget data={proofData} position="floating" />
}

export function ViewingActivity({ viewerCount, route }: { viewerCount: number; route: string }) {
  const proofData: SocialProofData[] = [{
    type: 'viewing',
    message: `${viewerCount} travelers are viewing flights on this route`,
    count: viewerCount,
    timestamp: new Date(),
    urgency: viewerCount > 10 ? 'high' : 'medium',
    route: route
  }]

  return <SocialProofWidget data={proofData} position="inline" />
}

export function PriceDropAlert({ route, savings, originalPrice }: { 
  route: string; 
  savings: number; 
  originalPrice: number 
}) {
  const proofData: SocialProofData[] = [{
    type: 'price_drop',
    message: `Price dropped by $${savings} on ${route} flights`,
    timestamp: new Date(),
    urgency: 'high',
    route: route
  }]

  return <SocialProofWidget data={proofData} position="header" />
}

export function AvailabilityWarning({ route, seatsLeft }: { route: string; seatsLeft: number }) {
  const proofData: SocialProofData[] = [{
    type: 'availability',
    message: `Only ${seatsLeft} seats left at this price for ${route}`,
    timestamp: new Date(),
    urgency: seatsLeft <= 3 ? 'high' : seatsLeft <= 7 ? 'medium' : 'low',
    route: route
  }]

  return <SocialProofWidget data={proofData} position="inline" />
}

export function CustomerReview({ 
  userName, 
  userImage, 
  review, 
  rating, 
  location 
}: {
  userName: string
  userImage?: string
  review: string
  rating: number
  location?: string
}) {
  const proofData: SocialProofData[] = [{
    type: 'review',
    message: `"${review}"`,
    userName,
    userImage,
    rating,
    location,
    timestamp: new Date(),
    urgency: 'low'
  }]

  return <SocialProofWidget data={proofData} position="sidebar" />
}

// Hook for managing multiple social proof widgets
export function useSocialProof() {
  const [proofQueue, setProofQueue] = useState<SocialProofData[]>([])

  const addProof = (proof: SocialProofData) => {
    setProofQueue((prev: SocialProofData[]) => [...prev, proof].slice(-5)) // Keep last 5
  }

  const removeProof = (index: number) => {
    setProofQueue((prev: SocialProofData[]) => prev.filter((_: SocialProofData, i: number) => i !== index))
  }

  // Simulate real-time booking data (replace with actual MCP integration)
  useEffect(() => {
    const simulateBookings = () => {
      const routes = ['NYC → LAX', 'MIA → NYC', 'LAX → CHI', 'BOS → SF']
      const locations = ['New York', 'Miami', 'Los Angeles', 'Boston', 'Chicago']
      const names = ['Sarah M.', 'John D.', 'Maria G.', 'David L.', 'Emma R.']
      
      const randomRoute = routes[Math.floor(Math.random() * routes.length)]
      const randomLocation = locations[Math.floor(Math.random() * locations.length)]
      const randomName = names[Math.floor(Math.random() * names.length)]
      
      addProof({
        type: 'booking',
        message: `${randomName} from ${randomLocation} just booked a flight`,
        userName: randomName,
        location: randomLocation,
        timestamp: new Date(),
        route: randomRoute,
        urgency: 'medium'
      })
    }

    // Add booking notification every 15-30 seconds
    const interval = setInterval(simulateBookings, 15000 + Math.random() * 15000)
    return () => clearInterval(interval)
  }, [])

  return {
    proofQueue,
    addProof,
    removeProof
  }
}