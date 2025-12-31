// Real images for jewelry products using CDN
// Using Unsplash Source CDN for fast, reliable image delivery
// Verified images for gold coins, gold bars, and jewelry

const UNSPLASH_CDN = "https://images.unsplash.com";
const IMAGE_PARAMS = "w=800&h=600&auto=format&fit=crop&q=85";

export const categoryImages: Record<string, string> = {
  // Gold Coins - Verified image showing gold and silver round coins
  // Image: https://unsplash.com/photos/gold-and-silver-round-coins-8t9c3ET7_Ts
  // Credit: Zlaťáky.cz (https://zlataky.cz)
  // This image shows a pile of gold bullion coins and bars from various mints:
  // Argor Heraeus, Münze Österreich, Royal Canadian Mint, U.S. Mint, 
  // Australian Mint of Perth, panda and Krugerrand
  coin: `https://unsplash.com/photos/8t9c3ET7_Ts/download?force=true&w=800`,
  
  // Gold Bars - Verified image showing a stack of gold bars
  // Image: https://unsplash.com/photos/a-stack-of-gold-bars-sitting-on-top-of-a-table-tgB2UnM2dmI
  // Credit: Scottsdale Mint (https://scottsdalemint.com)
  // Shows: Scottsdale Mint 1 Kilo Gold Bullion Bars - pure 9999 Fine gold
  bar: `https://unsplash.com/photos/tgB2UnM2dmI/download?force=true&w=800`,
  
  // Jewelry - Gold ring on white textile
  // Image: https://unsplash.com/photos/gold-ring-on-white-textile-ZYet8yoepik
  // Credit: Mariano Rivas (colormono on Unsplash)
  // Shows: "Con amor" wedding rings - gold ring on white textile
  jewellery: `https://unsplash.com/photos/ZYet8yoepik/download?force=true&w=800`,
};

export const storeImage = `${UNSPLASH_CDN}/photo-1605100804763-247f67b3557e?w=1200&h=600&auto=format&fit=crop&q=85`;

// Image Credits:
// - Gold Coins: Photo by Zlaťáky.cz on Unsplash
//   https://unsplash.com/photos/gold-and-silver-round-coins-8t9c3ET7_Ts
//   Credit: https://zlataky.cz (please credit when possible)
//
// - Gold Bars: Photo by Scottsdale Mint on Unsplash
//   https://unsplash.com/photos/a-stack-of-gold-bars-sitting-on-top-of-a-table-tgB2UnM2dmI
//   Shows: Scottsdale Mint 1 Kilo Gold Bullion Bars - pure 9999 Fine gold
//   Credit: Scottsdale Mint (https://scottsdalemint.com) - please give a shoutout if able!
//
// - Jewelry: Photo by Mariano Rivas on Unsplash
//   https://unsplash.com/photos/gold-ring-on-white-textile-ZYet8yoepik
//   Shows: "Con amor" wedding rings - gold ring on white textile
//   Credit: Mariano Rivas (colormono on Unsplash)

// IMPORTANT: The download URLs above may redirect. For best results:
// 1. Visit the Unsplash pages and right-click the images
// 2. Select "Copy image address" to get the direct image URLs
// 3. Replace the URLs above with the direct image URLs
// 
// Or use the images.unsplash.com format if you can find the photo ID:
// Format: https://images.unsplash.com/photo-[PHOTO-ID]?w=800&h=600&auto=format&fit=crop&q=85

// Alternative: Use your own images
// 1. Add images to public/images/ folder:
//    - gold-coins.jpg
//    - gold-bars.jpg
//    - jewelry.jpg
// 2. Update the URLs below to use local paths:
//
// export const categoryImages: Record<string, string> = {
//   coin: "/images/gold-coins.jpg",
//   bar: "/images/gold-bars.jpg",
//   jewellery: "/images/jewelry.jpg",
// };

// Alternative CDN options:
// 
// Option 1: Using Picsum Photos CDN (random images)
// export const categoryImages: Record<string, string> = {
//   coin: "https://picsum.photos/800/600?random=1",
//   bar: "https://picsum.photos/800/600?random=2",
//   jewellery: "https://picsum.photos/800/600?random=3",
// };
//
// Option 2: Using Cloudinary CDN (requires account)
// const CLOUDINARY_CDN = "https://res.cloudinary.com/your-cloud-name/image/upload";
// export const categoryImages: Record<string, string> = {
//   coin: `${CLOUDINARY_CDN}/w_800,h_600,c_fill,q_auto/gold-coins.jpg`,
//   bar: `${CLOUDINARY_CDN}/w_800,h_600,c_fill,q_auto/gold-bars.jpg`,
//   jewellery: `${CLOUDINARY_CDN}/w_800,h_600,c_fill,q_auto/jewelry.jpg`,
// };
