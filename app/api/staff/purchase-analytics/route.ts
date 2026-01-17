import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get purchase analytics for staff
 * Returns all order items with comprehensive price analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is staff or admin
    const supabase = createServiceRoleClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!user || !['admin', 'staff'].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    let query = supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price_at_purchase,
        metal_price_usd,
        exchange_rate_myr,
        exchange_rate_inr,
        gold_price_usd_at_purchase,
        silver_price_usd_at_purchase,
        exchange_rate_myr_usd_at_purchase,
        exchange_rate_inr_usd_at_purchase,
        price_history_snapshot,
        all_metal_prices_at_purchase,
        all_exchange_rates_at_purchase,
        pricing_metadata,
        created_at,
        order:orders (
          id,
          status,
          total,
          created_at,
          user_id,
          user:users!orders_user_id_fkey (
            id,
            name,
            email
          )
        ),
        product:products (
          id,
          name,
          category,
          weight,
          purity
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching purchase analytics:', error);
      return NextResponse.json(
        { error: "Failed to fetch purchase analytics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analytics: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Error in purchase analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
