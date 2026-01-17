import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/pricing-config
 * Get pricing configuration
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
    const { data, error } = await supabase
      .from("pricing_configuration")
      .select("*")
      .order("config_key");

    if (error) {
      console.error("Error fetching pricing config:", error);
      return NextResponse.json(
        { error: "Failed to fetch pricing configuration" },
        { status: 500 }
      );
    }

    // Transform data into config object
    const config: Record<string, any> = {};
    (data || []).forEach((row) => {
      config[row.config_key] = row.config_value;
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error in GET /api/admin/pricing-config:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing-config
 * Update pricing configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: "Configuration data is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update each configuration key
    const updates = Object.keys(config).map(async (key) => {
      const { error } = await supabase
        .from("pricing_configuration")
        .upsert(
          {
            config_key: key,
            config_value: config[key],
          },
          {
            onConflict: "config_key",
          }
        );

      if (error) {
        console.error(`Error updating ${key}:`, error);
        throw error;
      }
    });

    await Promise.all(updates);

    // Clear cache on the server side (client will refetch)
    // Note: In a production environment, you might want to use a cache invalidation service

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/admin/pricing-config:", error);
    return NextResponse.json(
      { error: "Failed to update pricing configuration" },
      { status: 500 }
    );
  }
}
