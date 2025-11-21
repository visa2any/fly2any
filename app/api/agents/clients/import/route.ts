// app/api/agents/clients/import/route.ts
// Bulk Client Import from CSV
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";

interface ClientCSVRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  preferredLanguage?: string;
  nationality?: string;
  preferredAirlines?: string;
  tripTypes?: string;
  favoriteDestinations?: string;
  tags?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get current client count
    const currentClientCount = await prisma!.agentClient.count({
      where: { agentId: agent.id, status: "ACTIVE" },
    });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();

    // Parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as ClientCSVRecord[];

    // Check if import would exceed limit
    if (currentClientCount + records.length > agent.maxClients) {
      return NextResponse.json(
        {
          error: `Import would exceed client limit (${agent.maxClients}). Upgrade your tier or reduce import size.`,
        },
        { status: 403 }
      );
    }

    const results = {
      total: records.length,
      imported: 0,
      skipped: 0,
      errors: [] as any[],
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        // Validate required fields
        if (!record.firstName || !record.lastName || !record.email) {
          results.skipped++;
          results.errors.push({
            row: i + 1,
            error: "Missing required fields (firstName, lastName, email)",
            data: record,
          });
          continue;
        }

        // Check for duplicate email
        const existing = await prisma!.agentClient.findFirst({
          where: {
            agentId: agent.id,
            email: record.email,
          },
        });

        if (existing) {
          results.skipped++;
          results.errors.push({
            row: i + 1,
            error: "Client with this email already exists",
            email: record.email,
          });
          continue;
        }

        // Parse arrays (if provided as comma-separated)
        const preferredAirlines = record.preferredAirlines
          ? record.preferredAirlines.split(",").map((a: string) => a.trim())
          : [];
        const tripTypes = record.tripTypes
          ? record.tripTypes.split(",").map((t: string) => t.trim())
          : [];
        const favoriteDestinations = record.favoriteDestinations
          ? record.favoriteDestinations.split(",").map((d: string) => d.trim())
          : [];
        const tags = record.tags
          ? record.tags.split(",").map((t: string) => t.trim())
          : [];

        // Create client
        await prisma!.agentClient.create({
          data: {
            agentId: agent.id,
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email,
            phone: record.phone || null,
            company: record.company || null,
            preferredLanguage: record.preferredLanguage || "en",
            nationality: record.nationality || null,
            address: record.address || null,
            city: record.city || null,
            state: record.state || null,
            country: record.country || null,
            zipCode: record.zipCode || null,
            cabinClass: record.cabinClass || null,
            preferredAirlines,
            homeAirport: record.homeAirport || null,
            seatPreference: record.seatPreference || null,
            mealPreference: record.mealPreference || null,
            budgetRange: record.budgetRange || null,
            tripTypes,
            favoriteDestinations,
            travelStyle: record.travelStyle || null,
            segment: (record.segment as any) || "STANDARD",
            tags,
            notes: record.notes || null,
          },
        });

        results.imported++;
      } catch (error: any) {
        results.skipped++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: record,
        });
      }
    }

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "clients_imported",
        description: `Bulk import: ${results.imported} clients imported, ${results.skipped} skipped`,
        metadata: {
          total: results.total,
          imported: results.imported,
          skipped: results.skipped,
        },
      },
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[CLIENT_IMPORT_ERROR]", error);
    return NextResponse.json(
      { error: "Import failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
