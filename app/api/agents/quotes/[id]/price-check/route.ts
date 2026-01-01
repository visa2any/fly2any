export const dynamic = 'force-dynamic';

// Price Check API - Monitor for price changes on quote items
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface PriceChange {
  itemId: string;
  itemType: string;
  itemName: string;
  originalPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  direction: "up" | "down";
  detectedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const quote = await prisma!.agentQuote.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const changes: PriceChange[] = [];

    // In a real implementation, we would:
    // 1. Check cached prices from when the quote was created
    // 2. Query live APIs (Duffel, hotel APIs) for current prices
    // 3. Compare and detect differences
    //
    // For now, we'll simulate price checks with random variations
    // This would be replaced with actual API calls in production

    const checkFlightPrices = async () => {
      const flights = quote.flights as any[];
      for (const flight of flights) {
        // Simulate API call - in production: await duffelApi.getOfferPrice(flight.offerId)
        const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
        const currentPrice = flight.price * (1 + variation);

        if (Math.abs(variation) > 0.02) {
          // Only report changes > 2%
          changes.push({
            itemId: flight.id || `flight-${flights.indexOf(flight)}`,
            itemType: "flight",
            itemName: `${flight.from} → ${flight.to}`,
            originalPrice: flight.price,
            currentPrice: Math.round(currentPrice),
            change: currentPrice - flight.price,
            changePercent: variation * 100,
            direction: variation < 0 ? "down" : "up",
            detectedAt: new Date(),
          });
        }
      }
    };

    const checkHotelPrices = async () => {
      const hotels = quote.hotels as any[];
      for (const hotel of hotels) {
        // Simulate API call - in production: await hotelApi.getRoomRate(hotel.rateId)
        const variation = (Math.random() - 0.5) * 0.08; // -4% to +4%
        const currentPrice = hotel.price * (1 + variation);

        if (Math.abs(variation) > 0.02) {
          changes.push({
            itemId: hotel.id || `hotel-${hotels.indexOf(hotel)}`,
            itemType: "hotel",
            itemName: hotel.name,
            originalPrice: hotel.price,
            currentPrice: Math.round(currentPrice),
            change: currentPrice - hotel.price,
            changePercent: variation * 100,
            direction: variation < 0 ? "down" : "up",
            detectedAt: new Date(),
          });
        }
      }
    };

    // Run price checks in parallel
    await Promise.all([checkFlightPrices(), checkHotelPrices()]);

    // Sort by absolute change (biggest changes first)
    changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    // Calculate summary
    const summary = {
      totalOriginal: changes.reduce((sum, c) => sum + c.originalPrice, 0),
      totalCurrent: changes.reduce((sum, c) => sum + c.currentPrice, 0),
      totalSavings: changes
        .filter((c) => c.direction === "down")
        .reduce((sum, c) => sum + Math.abs(c.change), 0),
      totalIncreases: changes
        .filter((c) => c.direction === "up")
        .reduce((sum, c) => sum + c.change, 0),
      hasDrops: changes.some((c) => c.direction === "down"),
      hasIncreases: changes.some((c) => c.direction === "up"),
    };

    return NextResponse.json({
      changes,
      summary,
      checkedAt: new Date(),
      quoteId: id,
    });

  } catch (error) {
    console.error("[PRICE_CHECK_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
