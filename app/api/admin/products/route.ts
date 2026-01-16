import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get paginated products (admin/staff only)
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - search: Search query (optional)
 *   - category: Filter by category (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";
    const category = categoryParam && ["coin", "bar", "jewellery"].includes(categoryParam) ? categoryParam : "";

    const supabase = createServiceRoleClient();
    
    // Build count query with filters
    let countQuery: any = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      countQuery = countQuery.eq('category', category);
    }

    // Get total count
    const { count } = await countQuery;

    // Build data query with filters
    let dataQuery: any = supabase
      .from('products')
      .select('*');

    if (search) {
      dataQuery = dataQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      dataQuery = dataQuery.eq('category', category);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
