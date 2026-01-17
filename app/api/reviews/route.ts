import { NextRequest, NextResponse } from "next/server";

/**
 * Get Google Reviews for KVT Jewellers
 * This endpoint can be extended to fetch from Google Places API
 * For now, returns sample reviews that can be replaced with actual Google API calls
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual Google Places API integration
    // You'll need: Google Places API key and Place ID for KVT Jewellers
    
    // Sample reviews structure matching Google Reviews format
    const reviews = [
      {
        id: "1",
        authorName: "Ahmad Rahman",
        authorPhoto: null,
        rating: 5,
        text: "Excellent service and authentic products! I purchased a gold bar and the quality is outstanding. Highly recommend KVT Jewellers for all your precious metal needs.",
        time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        relativeTime: "7 days ago",
      },
      {
        id: "2",
        authorName: "Sarah Tan",
        authorPhoto: null,
        rating: 5,
        text: "Beautiful jewelry collection! I bought a necklace for my wedding and it's absolutely stunning. The staff was very helpful and knowledgeable.",
        time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        relativeTime: "2 weeks ago",
      },
      {
        id: "3",
        authorName: "Lim Wei Ming",
        authorPhoto: null,
        rating: 5,
        text: "Great investment products. I've been buying gold coins from them for years. Always fair prices and genuine products. Trustworthy business!",
        time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
        relativeTime: "3 weeks ago",
      },
      {
        id: "4",
        authorName: "Priya Devi",
        authorPhoto: null,
        rating: 5,
        text: "Amazing experience! The product quality is excellent and the pricing is competitive. Fast delivery and secure packaging. Will definitely shop here again.",
        time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        relativeTime: "1 month ago",
      },
      {
        id: "5",
        authorName: "Mohd Faisal",
        authorPhoto: null,
        rating: 5,
        text: "Best jeweller in town! Authentic gold and silver products. The staff explained everything clearly and helped me choose the perfect piece.",
        time: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        relativeTime: "1 month ago",
      },
    ];

    // Calculate average rating
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const totalReviews = reviews.length;

    return NextResponse.json({
      reviews,
      averageRating: averageRating.toFixed(1),
      totalReviews,
      // Google Business Profile link (replace with actual)
      googleBusinessUrl: "https://www.google.com/maps/place/KVT+Jewellers",
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
