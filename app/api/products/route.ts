import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { dbProductToProduct } from "@/lib/db/products";
import { fetchExchangeRates } from "@/lib/currency-converter";
import { calculateProductPrice } from "@/lib/pricing/calculate-product-price";
import { ensure24hHistoryRecorded } from "@/lib/ensure-24h-history";
import type { ProductCategory } from "@/lib/product-categories";
import { categoryGroups } from "@/lib/product-categories";
import type { Product } from "@/types/products";

/**
 * Get paginated products (public)
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 25, max: 50)
 *   - search: Search query (optional)
 *   - category: Filter by category (optional) - can be "all", "investment", "jewelry", or specific category
 *   - priceMin: Minimum price (optional)
 *   - priceMax: Maximum price (optional)
 *   - purity: Filter by purity (optional)
 *   - sortBy: Sort option - "newest" | "price-low" | "price-high" | "name-asc" | "name-desc" (default: "newest")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "all";
    const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : null;
    const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : null;
    const purity = searchParams.get("purity") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const currency = (searchParams.get("currency") || "MYR") as "USD" | "MYR" | "INR"; // Default to MYR as products are stored in MYR

    console.log(`[Products API] Request received - Currency: ${currency}, Page: ${page}`);

    const supabase = createServiceRoleClient();
    
    // Build count query with filters
    let countQuery: any = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Build data query with filters
    let dataQuery: any = supabase
      .from('products')
      .select('*')
      .eq('active', true);

    // Search filter
    if (search) {
      const searchFilter = `name.ilike.%${search}%,description.ilike.%${search}%`;
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    // Category filter
    if (categoryParam !== "all") {
      if (categoryParam === "investment") {
        // Filter by investment group
        const investmentCategories = categoryGroups.investment.categories;
        countQuery = countQuery.in('category', investmentCategories);
        dataQuery = dataQuery.in('category', investmentCategories);
      } else if (categoryParam === "jewelry") {
        // Filter by jewelry group
        const jewelryCategories = categoryGroups.jewelry.categories;
        countQuery = countQuery.in('category', jewelryCategories);
        dataQuery = dataQuery.in('category', jewelryCategories);
      } else {
        // Filter by specific category
        countQuery = countQuery.eq('category', categoryParam);
        dataQuery = dataQuery.eq('category', categoryParam);
      }
    }

    // Price filters
    if (priceMin !== null) {
      countQuery = countQuery.gte('price', priceMin);
      dataQuery = dataQuery.gte('price', priceMin);
    }
    if (priceMax !== null) {
      countQuery = countQuery.lte('price', priceMax);
      dataQuery = dataQuery.lte('price', priceMax);
    }

    // Purity filter
    if (purity) {
      countQuery = countQuery.eq('purity', purity);
      dataQuery = dataQuery.eq('purity', purity);
    }

    // Get total count
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error("Error fetching product count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch product count", details: countError.message },
        { status: 500 }
      );
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
    dataQuery = dataQuery.range(from, to);

    const { data: products, error } = await dataQuery;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Convert database products to Product type
    let convertedProducts = (products || []).map(dbProductToProduct);

    // Calculate/convert prices based on currency - optimized to fetch prices once
    // ALWAYS convert prices, even if currency is MYR (to ensure consistency)
    try {
      // OPTIMIZATION: Fetch exchange rates once for all products (uses cached rates from currency-converter)
      const exchangeRates = await fetchExchangeRates();
      
      // Ensure 24h history is recorded (non-blocking, uses existing history)
      ensure24hHistoryRecorded().catch(err => 
        console.error("Failed to ensure 24h history in products API:", err)
      );
      
      // Helper function to convert static prices (using pre-fetched rates)
      // Products are stored in MYR, so we convert from MYR to target currency
      function convertStaticPrice(product: Product, targetCurrency: "USD" | "MYR" | "INR", rates: { MYR: number; INR: number }): Product {
        if (!product.price) {
          return product;
        }

        // If target is MYR, return as-is (products are already in MYR)
        if (targetCurrency === "MYR") {
          return product;
        }

        // Convert from MYR to USD first
        const priceUSD = product.price / rates.MYR;
        let convertedPrice: number;
        
        if (targetCurrency === "USD") {
          convertedPrice = priceUSD;
        } else if (targetCurrency === "INR") {
          // Convert USD to INR
          convertedPrice = priceUSD * rates.INR;
        } else {
          return product;
        }
        
        // Round to 2 decimal places
        return { ...product, price: Math.round(convertedPrice * 100) / 100 };
      }

      // Check if any products need dynamic calculation
      const hasProductsNeedingCalculation = convertedProducts.some((p: Product) => p.weight && p.purity);

      // Fetch metal prices once for all dynamic calculations (only if needed)
      let goldPriceUSD: number | null = null;
      let silverPriceUSD: number | null = null;
      
      if (hasProductsNeedingCalculation) {
        try {
          const { fetchGoldPriceUSD, fetchSilverPriceUSD } = await import("@/lib/gold-price-api");
          [goldPriceUSD, silverPriceUSD] = await Promise.all([
            fetchGoldPriceUSD(),
            fetchSilverPriceUSD(),
          ]);
        } catch (error) {
          console.error("Error fetching metal prices:", error);
        }
      }

      // Process all products in parallel
      const productsWithCalculatedPrices = await Promise.all(
        convertedProducts.map(async (product: Product) => {
          // If product has weight and purity, calculate dynamic price
          if (product.weight && product.purity && goldPriceUSD !== null && silverPriceUSD !== null) {
            try {
              // Determine metal type
              let metalType: "gold" | "silver" = "gold";
              if (product.metalType) {
                metalType = product.metalType === "silver" ? "silver" : "gold";
              } else {
                if (product.category === "silver_bar" || product.category === "silver_coin") {
                  metalType = "silver";
                }
              }

              const metalPriceUSD = metalType === "gold" ? goldPriceUSD : silverPriceUSD;
              const weight = product.weight || 0;
              const purityStr = product.purity || "916";
              const purity = parseFloat(purityStr) / 1000;

              // Calculate base price in USD
              const metalPriceUSDPerGram = metalPriceUSD / 31.1035;
              const basePriceUSD = metalPriceUSDPerGram * weight * purity;

              // Convert to target currency
              let calculatedPrice: number;
              switch (currency) {
                case "USD":
                  calculatedPrice = basePriceUSD;
                  break;
                case "MYR":
                  calculatedPrice = basePriceUSD * exchangeRates.MYR;
                  break;
                case "INR":
                  calculatedPrice = basePriceUSD * exchangeRates.INR;
                  break;
                default:
                  calculatedPrice = basePriceUSD;
              }

              const finalPrice = Math.round(calculatedPrice * 100) / 100;
              return { ...product, price: finalPrice };
            } catch (error) {
              console.error(`Error calculating price for product ${product.id}:`, error);
              // Fallback to static price conversion
              return convertStaticPrice(product, currency, exchangeRates);
            }
          } else {
            // Convert static price
            return convertStaticPrice(product, currency, exchangeRates);
          }
        })
      );

      convertedProducts = productsWithCalculatedPrices;
      
      // Log sample conversions for debugging
      if (convertedProducts.length > 0 && currency !== "MYR") {
        const sample = convertedProducts[0];
        const originalDbProduct = products?.find((p: any) => p.id === sample.id);
        if (originalDbProduct && sample.price) {
          const originalPrice = originalDbProduct.price;
          const convertedPrice = sample.price;
          const conversionRatio = convertedPrice / originalPrice;
          console.log(`[Products API] Conversion check - ${sample.name}:`);
          console.log(`  Original (MYR): ${originalPrice}`);
          console.log(`  Converted (${currency}): ${convertedPrice}`);
          console.log(`  Ratio: ${conversionRatio.toFixed(4)}`);
          console.log(`  Exchange rates: MYR=${exchangeRates.MYR}, INR=${exchangeRates.INR}`);
          
          // Verify conversion is correct
          if (currency === "USD") {
            const expectedPrice = originalPrice / exchangeRates.MYR;
            console.log(`  Expected USD: ${expectedPrice.toFixed(2)}, Got: ${convertedPrice.toFixed(2)}`);
          } else if (currency === "INR") {
            const expectedPrice = (originalPrice / exchangeRates.MYR) * exchangeRates.INR;
            console.log(`  Expected INR: ${expectedPrice.toFixed(2)}, Got: ${convertedPrice.toFixed(2)}`);
          }
        }
      }
    } catch (error) {
      console.error("Error calculating/converting prices:", error);
      // Continue with original prices if conversion fails
    }

    // OPTIMIZATION: Add cache headers for better performance
    // Cache for 60 seconds, but allow stale-while-revalidate
    const response = NextResponse.json({
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
    
    // Only cache if no cache-busting timestamp is present
    const hasCacheBust = searchParams.has("_t");
    if (!hasCacheBust) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
    
    return response;
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
