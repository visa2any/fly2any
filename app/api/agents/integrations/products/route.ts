// app/api/agents/integrations/products/route.ts
// Manage product catalog (activities, transfers, car rentals, insurance, etc.)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const CreateProductSchema = z.object({
  supplierId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().default("other"),
  type: z.string().default("service"),
  // Pricing
  costPrice: z.number().min(0), // What agent pays supplier
  sellPrice: z.number().min(0), // What agent charges client
  currency: z.string().default("USD"),
  commissionRate: z.number().default(0.10),
  // Availability
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  stock: z.number().optional(),
  minOrder: z.number().optional(),
  maxOrder: z.number().optional(),
  daysAvailable: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])).optional(),
  // Details
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  whatToBring: z.array(z.string()).optional(),
  cancellationPolicy: z.string().optional(),
  // Media
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  // Internal
  internalNotes: z.string().optional(),
});

const ProductFilterSchema = z.object({
  productType: z.enum(["ACTIVITY", "TRANSFER", "CAR_RENTAL", "INSURANCE", "CRUISE", "PACKAGE", "OTHER"]).optional(),
  supplierId: z.string().optional(),
  destination: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// GET /api/agents/integrations/products - List products
export async function GET(request: NextRequest) {
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

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = ProductFilterSchema.parse(searchParams);

    // Build where clause
    const where: any = {
      agentId: agent.id,
    };

    if (filters.productType) {
      where.productType = filters.productType;
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters.destination) {
      where.destination = { contains: filters.destination, mode: "insensitive" };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma!.agentProduct.count({ where });

    // Get paginated products
    const products = await prisma!.agentProduct.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            category: true,
            commissionRate: true,
          },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate profit margin for each product
    const productsWithMargin = products.map(product => ({
      ...product,
      profitMargin: product.sellPrice - product.costPrice,
      profitMarginPercent: ((product.sellPrice - product.costPrice) / product.costPrice) * 100,
    }));

    // Group by category
    const productsByType = products.reduce((acc: any, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    return NextResponse.json({
      products: productsWithMargin,
      productsByType,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
      stats: {
        total,
        active: products.filter(p => p.isActive).length,
        featured: products.filter(p => p.isFeatured).length,
        byType: Object.entries(productsByType).map(([type, items]) => ({
          type,
          count: (items as any[]).length,
        })),
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_LIST_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/agents/integrations/products - Create new product
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

    const body = await request.json();
    const productData = CreateProductSchema.parse(body);

    // Verify supplier belongs to agent
    const supplier = await prisma!.agentSupplier.findFirst({
      where: {
        id: productData.supplierId,
        agentId: agent.id,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Validate selling price > cost price
    if (productData.sellPrice <= productData.costPrice) {
      return NextResponse.json(
        { error: "Selling price must be greater than cost price" },
        { status: 400 }
      );
    }

    const product = await prisma!.agentProduct.create({
      data: {
        agentId: agent.id,
        ...productData,
      },
      include: {
        supplier: true,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "product_created",
        description: `Added new product: ${product.name}`,
        entityType: "product",
        entityId: product.id,
        metadata: {
          productName: product.name,
          productType: product.type,
          supplierName: supplier.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCT_CREATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
