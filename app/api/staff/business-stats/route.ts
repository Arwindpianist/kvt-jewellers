import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get comprehensive business statistics
 * GET /api/staff/business-stats
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

    const supabase = createServiceRoleClient();

    // Get all statistics in parallel
    const [
      { data: users },
      { data: customers },
      { data: orders },
      { data: wishlistItems },
      { data: preRegistrations },
      { data: products },
      { data: orderItems },
    ] = await Promise.all([
      supabase.from('users').select('id, created_at, role'),
      supabase.from('users').select('id, created_at').eq('role', 'customer'),
      supabase.from('orders').select('id, total, status, created_at, user_id'),
      supabase.from('wishlist').select('id, user_id, product_id, created_at'),
      supabase.from('trading_pre_registrations').select('id, status, created_at'),
      supabase.from('products').select('id, created_at'),
      supabase.from('order_items').select('id, quantity, price_at_purchase, created_at'),
    ]);

    // Calculate time periods
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = users?.length || 0;
    const totalCustomers = customers?.length || 0;
    const newUsers24h = users?.filter(u => new Date(u.created_at) >= last24h).length || 0;
    const newUsers7d = users?.filter(u => new Date(u.created_at) >= last7d).length || 0;
    const newUsers30d = users?.filter(u => new Date(u.created_at) >= last30d).length || 0;

    // Order statistics
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => ['payment_verified', 'completed'].includes(o.status)).length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const completedRevenue = orders?.filter(o => ['payment_verified', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const orders24h = orders?.filter(o => new Date(o.created_at) >= last24h).length || 0;
    const orders7d = orders?.filter(o => new Date(o.created_at) >= last7d).length || 0;
    const orders30d = orders?.filter(o => new Date(o.created_at) >= last30d).length || 0;
    const revenue24h = orders?.filter(o => new Date(o.created_at) >= last24h)
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const revenue7d = orders?.filter(o => new Date(o.created_at) >= last7d)
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const revenue30d = orders?.filter(o => new Date(o.created_at) >= last30d)
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    // Wishlist statistics
    const totalWishlistItems = wishlistItems?.length || 0;
    const uniqueWishlistUsers = new Set(wishlistItems?.map(w => w.user_id)).size;
    const wishlistItems24h = wishlistItems?.filter(w => new Date(w.created_at) >= last24h).length || 0;
    const wishlistItems7d = wishlistItems?.filter(w => new Date(w.created_at) >= last7d).length || 0;
    const avgWishlistItemsPerUser = uniqueWishlistUsers > 0 ? totalWishlistItems / uniqueWishlistUsers : 0;

    // Pre-registration statistics
    const totalPreRegistrations = preRegistrations?.length || 0;
    const pendingPreRegistrations = preRegistrations?.filter(p => p.status === 'pending').length || 0;
    const convertedPreRegistrations = preRegistrations?.filter(p => p.status === 'converted').length || 0;
    const preRegistrations24h = preRegistrations?.filter(p => new Date(p.created_at) >= last24h).length || 0;
    const preRegistrations7d = preRegistrations?.filter(p => new Date(p.created_at) >= last7d).length || 0;
    const conversionRate = totalPreRegistrations > 0 ? (convertedPreRegistrations / totalPreRegistrations) * 100 : 0;

    // Product statistics
    const totalProducts = products?.length || 0;
    const products24h = products?.filter(p => new Date(p.created_at) >= last24h).length || 0;
    const products7d = products?.filter(p => new Date(p.created_at) >= last7d).length || 0;

    // Order items statistics
    const totalItemsSold = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const itemsSold24h = orderItems?.filter(item => new Date(item.created_at) >= last24h)
      .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const itemsSold7d = orderItems?.filter(item => new Date(item.created_at) >= last7d)
      .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    // Customer engagement
    const customersWithOrders = new Set(orders?.map(o => o.user_id)).size;
    const customersWithWishlist = uniqueWishlistUsers;
    const customerEngagementRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
    const avgOrdersPerCustomer = customersWithOrders > 0 ? totalOrders / customersWithOrders : 0;

    // Conversion metrics
    const orderConversionRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
    const wishlistToOrderRate = uniqueWishlistUsers > 0 ? (customersWithOrders / uniqueWishlistUsers) * 100 : 0;

    return NextResponse.json({
      users: {
        total: totalUsers,
        customers: totalCustomers,
        new24h: newUsers24h,
        new7d: newUsers7d,
        new30d: newUsers30d,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        revenue: totalRevenue,
        completedRevenue,
        avgOrderValue,
        count24h: orders24h,
        count7d: orders7d,
        count30d: orders30d,
        revenue24h,
        revenue7d,
        revenue30d,
      },
      wishlist: {
        totalItems: totalWishlistItems,
        uniqueUsers: uniqueWishlistUsers,
        items24h: wishlistItems24h,
        items7d: wishlistItems7d,
        avgItemsPerUser: Math.round(avgWishlistItemsPerUser * 10) / 10,
      },
      preRegistrations: {
        total: totalPreRegistrations,
        pending: pendingPreRegistrations,
        converted: convertedPreRegistrations,
        count24h: preRegistrations24h,
        count7d: preRegistrations7d,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
      products: {
        total: totalProducts,
        new24h: products24h,
        new7d: products7d,
      },
      sales: {
        totalItemsSold,
        itemsSold24h,
        itemsSold7d,
      },
      engagement: {
        customersWithOrders,
        customersWithWishlist,
        customerEngagementRate: Math.round(customerEngagementRate * 10) / 10,
        avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 10) / 10,
        orderConversionRate: Math.round(orderConversionRate * 10) / 10,
        wishlistToOrderRate: Math.round(wishlistToOrderRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching business stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch business statistics" },
      { status: 500 }
    );
  }
}
