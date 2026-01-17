import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { getAllProductsAdmin } from "@/lib/db/products";
import { getRecentActivityLogs } from "@/lib/activity-log";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/staff/DashboardContent";
import { StaffDashboardHeader } from "@/components/staff/StaffDashboardHeader";
import { DashboardSkeleton } from "@/components/staff/skeletons/DashboardSkeleton";
import { headers } from "next/headers";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  const prices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(prices);
  const products = await getAllProductsAdmin();
  const recentActivity = getRecentActivityLogs(10);
  const allActivityLogs = getRecentActivityLogs(100);

  // Get order statistics and recent orders
  const supabase = createServiceRoleClient();
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      created_at,
      payment_reference,
      user:users (
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    payment_pending: orders?.filter(o => o.status === 'payment_pending').length || 0,
    payment_verified: orders?.filter(o => o.status === 'payment_verified').length || 0,
    completed: orders?.filter(o => o.status === 'completed').length || 0,
    revenue: orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
  };

  // Get recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) || [];

  // Fetch business statistics directly from database
  let businessStats = null;
  try {
    // Get all statistics in parallel
    const [
      { data: users },
      { data: customers },
      { data: allOrders },
      { data: wishlistItems },
      { data: preRegistrations },
      { data: allProducts },
      { data: orderItems },
    ] = await Promise.all([
      supabase.from('users').select('id, created_at, role'),
      supabase.from('users').select('id, created_at').eq('role', 'customer'),
      supabase.from('orders').select('id, total, status, created_at, user_id').order('created_at', { ascending: false }),
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
    const totalOrders = allOrders?.length || 0;
    const completedOrders = allOrders?.filter(o => ['payment_verified', 'completed'].includes(o.status)).length || 0;
    const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const completedRevenue = allOrders?.filter(o => ['payment_verified', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const orders24h = allOrders?.filter(o => new Date(o.created_at) >= last24h).length || 0;
    const orders7d = allOrders?.filter(o => new Date(o.created_at) >= last7d).length || 0;
    const orders30d = allOrders?.filter(o => new Date(o.created_at) >= last30d).length || 0;
    const revenue24h = allOrders?.filter(o => new Date(o.created_at) >= last24h)
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const revenue7d = allOrders?.filter(o => new Date(o.created_at) >= last7d)
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    const revenue30d = allOrders?.filter(o => new Date(o.created_at) >= last30d)
      .reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    
    // Calculate revenue trend data for last 7 days
    const revenueTrendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayRevenue = allOrders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      }).reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
      
      revenueTrendData.push({
        date: format(dayStart, "MMM d"),
        revenue: dayRevenue,
      });
    }
    
    // Calculate previous period for comparison
    const previous7dStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previous7dEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousRevenue7d = allOrders?.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate >= previous7dStart && orderDate < previous7dEnd;
    }).reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
    
    const revenueGrowth = previousRevenue7d > 0 
      ? ((revenue7d - previousRevenue7d) / previousRevenue7d) * 100 
      : 0;
    
    const previousOrders7d = allOrders?.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate >= previous7dStart && orderDate < previous7dEnd;
    }).length || 0;
    
    const ordersGrowth = previousOrders7d > 0
      ? ((orders7d - previousOrders7d) / previousOrders7d) * 100
      : 0;

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
    const totalProducts = allProducts?.length || 0;
    const products24h = allProducts?.filter(p => new Date(p.created_at) >= last24h).length || 0;
    const products7d = allProducts?.filter(p => new Date(p.created_at) >= last7d).length || 0;

    // Order items statistics
    const totalItemsSold = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const itemsSold24h = orderItems?.filter(item => new Date(item.created_at) >= last24h)
      .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const itemsSold7d = orderItems?.filter(item => new Date(item.created_at) >= last7d)
      .reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    
    // Get top products (most ordered) - from completed orders
    const completedOrderIds = allOrders?.filter(o => ['payment_verified', 'completed'].includes(o.status)).map(o => o.id) || [];
    let topProducts: Array<{ productId: string; sales: number }> = [];
    
    if (completedOrderIds.length > 0) {
      const { data: completedOrderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('order_id', completedOrderIds);
      
      const productSales = new Map<string, number>();
      completedOrderItems?.forEach(item => {
        if (item.product_id) {
          const current = productSales.get(item.product_id) || 0;
          productSales.set(item.product_id, current + (item.quantity || 0));
        }
      });
      
      topProducts = Array.from(productSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId, count]) => ({ productId, sales: count }));
    }

    // Customer engagement
    const customersWithOrders = new Set(allOrders?.map(o => o.user_id)).size;
    const customersWithWishlist = uniqueWishlistUsers;
    const customerEngagementRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
    const avgOrdersPerCustomer = customersWithOrders > 0 ? totalOrders / customersWithOrders : 0;

    // Conversion metrics
    const orderConversionRate = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;
    const wishlistToOrderRate = uniqueWishlistUsers > 0 ? (customersWithOrders / uniqueWishlistUsers) * 100 : 0;

    businessStats = {
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
        revenueTrendData,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
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
        topProducts,
      },
      engagement: {
        customersWithOrders,
        customersWithWishlist,
        customerEngagementRate: Math.round(customerEngagementRate * 10) / 10,
        avgOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 10) / 10,
        orderConversionRate: Math.round(orderConversionRate * 10) / 10,
        wishlistToOrderRate: Math.round(wishlistToOrderRate * 10) / 10,
      },
    };
  } catch (error) {
    console.error("Error calculating business stats:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffDashboardHeader userName={session.user.name} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          userName={session.user.name}
          publishedPrices={publishedPrices}
          allPrices={prices}
          products={products}
          recentActivity={recentActivity}
          allActivityLogs={allActivityLogs}
          orderStats={orderStats}
          recentOrders={recentOrders}
          businessStats={businessStats}
        />
      </Suspense>
    </div>
  );
}

