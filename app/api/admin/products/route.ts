import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { dbProductToProduct } from "@/lib/db/products";

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
    const category = categoryParam || "";
    const metalType = searchParams.get("metalType") || "";
    const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : null;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : null;
    const sortBy = searchParams.get("sortBy") || "newest";

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
    if (metalType) {
      countQuery = countQuery.eq('metal_type', metalType);
    }
    if (priceMin !== null) {
      countQuery = countQuery.gte('price', priceMin);
    }
    if (priceMax !== null) {
      countQuery = countQuery.lte('price', priceMax);
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
    if (metalType) {
      dataQuery = dataQuery.eq('metal_type', metalType);
    }
    if (priceMin !== null) {
      dataQuery = dataQuery.gte('price', priceMin);
    }
    if (priceMax !== null) {
      dataQuery = dataQuery.lte('price', priceMax);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        dataQuery = dataQuery.order('price', { ascending: true, nullsFirst: false });
        break;
      case "price-high":
        dataQuery = dataQuery.order('price', { ascending: false, nullsFirst: false });
        break;
      case "name-asc":
        dataQuery = dataQuery.order('name', { ascending: true });
        break;
      case "name-desc":
        dataQuery = dataQuery.order('name', { ascending: false });
        break;
      case "newest":
      default:
        dataQuery = dataQuery.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error } = await dataQuery.range(from, to);

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Convert database products to Product type (handles image -> images conversion)
    const convertedProducts = (products || []).map(dbProductToProduct);

    return NextResponse.json({
      products: convertedProducts,
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
