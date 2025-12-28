export const dynamic = 'force-dynamic';

// app/api/agents/integrations/products/[id]/route.ts
// Get, Update, and Delete Product
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateProductSchema = z.object({
  supplierId: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  sellPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  commissionRate: z.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  stock: z.number().optional(),
  minOrder: z.number().optional(),
  maxOrder: z.number().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  externalId: z.string().optional(),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/agents/integrations/products/[id] - Get product details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma!.agentProduct.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        supplier: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate profit metrics
    const profitMargin = product.sellPrice - product.costPrice;
    const profitMarginPercent = (profitMargin / product.costPrice) * 100;

    return NextResponse.json({
      product: {
        ...product,
        profitMargin,
        profitMarginPercent,
      },
    });
  } catch (error) {
    console.error("[PRODUCT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/integrations/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma!.agentProduct.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates = UpdateProductSchema.parse(body);

    // If supplier is being updated, verify it belongs to agent
    if (updates.supplierId) {
      const supplier = await prisma!.agentSupplier.findFirst({
        where: {
          id: updates.supplierId,
          agentId: agent.id,
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404 }
        );
      }
    }

    // Validate pricing if being updated
    const newCostPrice = updates.costPrice ?? product.costPrice;
    const newSellPrice = updates.sellPrice ?? product.sellPrice;

    if (newSellPrice <= newCostPrice) {
      return NextResponse.json(
        { error: "Selling price must be greater than cost price" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma!.agentProduct.update({
      where: { id: product.id },
      data: updates,
      include: {
        supplier: true,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "product_updated",
        description: `Updated product: ${updatedProduct.name}`,
        entityType: "product",
        entityId: product.id,
        metadata: {
          updates: Object.keys(updates),
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("[PRODUCT_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/integrations/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma!.agentProduct.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Soft delete by marking as inactive instead of hard delete
    // This preserves data for quotes/bookings that used this product
    const deletedProduct = await prisma!.agentProduct.update({
      where: { id: product.id },
      data: {
        isActive: false,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "product_deleted",
        description: `Deleted product: ${product.name}`,
        entityType: "product",
        entityId: product.id,
        metadata: {
          productName: product.name,
          productType: product.type,
          productCategory: product.category,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("[PRODUCT_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
