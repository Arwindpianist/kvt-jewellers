import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Get all customers with statistics - Staff/Admin only
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

    // Check if user is admin or staff
    const supabase = createServiceRoleClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!user || !['admin', 'staff'].includes(user.role)) {
      return NextResponse.json(
        { error: "Staff access required" },
        { status: 403 }
      );
    }

    // Get all customers with order statistics
    const { data: customers, error: customersError } = await supabase
      .from('users')
      .select(`
        *,
        orders!inner (
          id,
          total,
          created_at,
          status
        )
      `)
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error("Error fetching customers:", customersError);
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total, user_id, status, created_at')
      .in('status', ['payment_verified', 'completed']);

    const { data: allCustomers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'customer');

    const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
    const totalOrders = allOrders?.length || 0;
    const totalCustomers = allCustomers?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get customers with orders
    const customerIdsWithOrders = new Set(allOrders?.map(o => o.user_id) || []);
    const customersWithOrders = customerIdsWithOrders.size;

    // Process customers with their stats
    const customersMap = new Map<string, any>();
    
    // Initialize all customers
    const { data: allCustomersData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    allCustomersData?.forEach(customer => {
      customersMap.set(customer.id, {
        ...customer,
        order_count: 0,
        total_spent: 0,
        last_order_date: null,
      });
    });

    // Calculate stats from orders
    allOrders?.forEach(order => {
      const customer = customersMap.get(order.user_id);
      if (customer) {
        customer.order_count = (customer.order_count || 0) + 1;
        customer.total_spent = (customer.total_spent || 0) + Number(order.total || 0);
        
        const orderDate = order.created_at || '';
        if (!customer.last_order_date || orderDate > customer.last_order_date) {
          customer.last_order_date = orderDate;
        }
      }
    });

    // Convert map to array
    const customersWithStats = Array.from(customersMap.values());

    return NextResponse.json({
      customers: customersWithStats,
      stats: {
        totalCustomers,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        customersWithOrders,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
