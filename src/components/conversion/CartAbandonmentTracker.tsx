// Cart Abandonment Recovery System for Fly2Any
// Using ShadCN UI + Marketing Psychology Principles

'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Clock, Mail, Percent, Users, Zap } from "lucide-react"

interface BookingData {
  id: string
  type: 'flight' | 'hotel' | 'car'
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  passengers?: number
  price: number
  currency: string
  timestamp: Date
  userEmail?: string
  searchCount: number
}

interface CartAbandonmentTrackerProps {
  bookingData: BookingData
  onEmailCapture: (email: string, bookingId: string) => void
  onDiscountOffer: (bookingId: string, discountPercent: number) => void
}

export function CartAbandonmentTracker({
  bookingData,
  onEmailCapture,
  onDiscountOffer
}: CartAbandonmentTrackerProps) {
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [showUrgencyModal, setShowUrgencyModal] = useState(false)
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [scrollDepth, setScrollDepth] = useState(0)
  const [email, setEmail] = useState('')
  const [hasShownDiscount, setHasShownDiscount] = useState(false)
  
  const startTime = useRef(Date.now())
  const exitIntentRef = useRef(false)

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.body.offsetHeight - window.innerHeight
      const scrollPercent = Math.floor((scrollTop / docHeight) * 100)
      setScrollDepth(Math.max(scrollDepth, scrollPercent))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollDepth])

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentRef.current && timeOnPage > 30) {
        exitIntentRef.current = true
        setShowExitIntent(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [timeOnPage])

  // Urgency triggers based on behavior
  useEffect(() => {
    // Show urgency modal after 3 minutes of browsing
    if (timeOnPage === 180 && scrollDepth > 50 && !hasShownDiscount) {
      setShowUrgencyModal(true)
      setHasShownDiscount(true)
    }
  }, [timeOnPage, scrollDepth, hasShownDiscount])

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const calculateSavings = (originalPrice: number, discount: number) => {
    return originalPrice * (discount / 100)
  }

  const getUrgencyMessage = () => {
    const messages = [
      `${bookingData.searchCount} other travelers viewed this ${bookingData.type}`,
      "Prices typically increase 23% closer to departure date",
      "Limited availability - book now to secure your spot",
      "Our travel experts recommend booking within the next hour"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleEmailSubmit = () => {
    if (email) {
      onEmailCapture(email, bookingData.id)
      setShowExitIntent(false)
    }
  }

  const handleDiscountAccept = () => {
    onDiscountOffer(bookingData.id, 10) // 10% discount
    setShowUrgencyModal(false)
  }

  return (
    <>
      {/* Sticky Urgency Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-travel-orange-500 to-travel-orange-600 text-white px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getUrgencyMessage()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-white text-travel-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              {Math.max(0, 1800 - timeOnPage)}s left
            </Badge>
            <Button size="sm" variant="secondary" className="bg-white text-travel-orange-600 hover:bg-gray-100">
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Exit Intent Modal */}
      <Dialog open={showExitIntent} onOpenChange={setShowExitIntent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-travel-orange-600">
              <Mail className="h-5 w-5" />
              Wait! Don't Miss This Deal
            </DialogTitle>
            <DialogDescription>
              Get exclusive travel deals and price drop alerts directly to your inbox
            </DialogDescription>
          </DialogHeader>
          
          <Card className="border-travel-orange-200 bg-travel-orange-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    {formatPrice(bookingData.price, bookingData.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.origin} → {bookingData.destination}
                  </p>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {bookingData.searchCount} searches today
                  </span>
                  <Badge variant="outline" className="border-travel-orange-300 text-travel-orange-700">
                    Trending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email for exclusive deals"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="border-2 focus:border-travel-orange-500"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleEmailSubmit}
                className="flex-1 bg-travel-orange-600 hover:bg-travel-orange-700"
              >
                Get Price Alerts
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowExitIntent(false)}
                className="border-travel-orange-300"
              >
                No Thanks
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Urgency/Discount Modal */}
      <Dialog open={showUrgencyModal} onOpenChange={setShowUrgencyModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Zap className="h-5 w-5" />
              Limited Time Offer!
            </DialogTitle>
            <DialogDescription>
              Complete your booking in the next 10 minutes and save 10%
            </DialogDescription>
          </DialogHeader>
          
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-2xl">
                Save {formatPrice(calculateSavings(bookingData.price, 10), bookingData.currency)}
              </CardTitle>
              <CardDescription className="text-center">
                Original Price: <span className="line-through">{formatPrice(bookingData.price, bookingData.currency)}</span>
                <br />
                <span className="text-green-600 font-semibold text-lg">
                  Your Price: {formatPrice(bookingData.price - calculateSavings(bookingData.price, 10), bookingData.currency)}
                </span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                    <Percent className="h-4 w-4 mr-1" />
                    10% OFF
                  </Badge>
                </div>
                
                <div className="text-center text-sm text-muted-foreground space-y-1">
                  <p>✅ Free cancellation within 24 hours</p>
                  <p>✅ Price match guarantee</p>
                  <p>✅ 24/7 customer support</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button 
              onClick={handleDiscountAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              Claim 10% Discount
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowUrgencyModal(false)}
              className="border-gray-300"
            >
              Maybe Later
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            * Offer expires in 10 minutes. Cannot be combined with other offers.
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Hook for tracking abandonment behavior
export function useCartAbandonmentTracking() {
  const [abandonmentEvents, setAbandonmentEvents] = useState<{
    pageExits: number
    timeThresholds: number[]
    scrollDepthEvents: number[]
    searchCount: number
  }>({
    pageExits: 0,
    timeThresholds: [],
    scrollDepthEvents: [],
    searchCount: 0
  })

  const trackAbandonmentEvent = (eventType: string, data: any) => {
    // This would integrate with your analytics/MCP servers
    console.log('Cart Abandonment Event:', eventType, data)
    
    // Track with Google Analytics MCP
    // Track with HubSpot MCP for lead scoring
    // Trigger Zapier workflows for email automation
  }

  return {
    abandonmentEvents,
    trackAbandonmentEvent
  }
}