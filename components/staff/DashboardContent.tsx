"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { StaggerAnimation, StaggerItem } from "@/components/ui/stagger-animation";
import { HoverCard } from "@/components/ui/hover-card";
import type { GoldPrice } from "@/types/gold-prices";
import type { Product } from "@/types/products";

interface DashboardContentProps {
  userName: string;
  publishedPrices: GoldPrice[];
  allPrices: GoldPrice[];
  products: Product[];
}

export function DashboardContent({
  userName,
  publishedPrices,
  allPrices,
  products,
}: DashboardContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userName}</p>
      </motion.div>

      <StaggerAnimation>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StaggerItem>
            <HoverCard>
              <Card>
                <CardHeader>
                  <CardTitle>Published Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-3xl font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {publishedPrices.length}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">out of {allPrices.length} total</p>
                  <AnimatedButton asChild variant="outline" className="mt-4 w-full">
                    <Link href="/staff/prices">Manage Prices</Link>
                  </AnimatedButton>
                </CardContent>
              </Card>
            </HoverCard>
          </StaggerItem>

          <StaggerItem>
            <HoverCard>
              <Card>
                <CardHeader>
                  <CardTitle>Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="text-3xl font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    {products.length}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">products in catalog</p>
                  <AnimatedButton asChild variant="outline" className="mt-4 w-full">
                    <Link href="/staff/products">Manage Products</Link>
                  </AnimatedButton>
                </CardContent>
              </Card>
            </HoverCard>
          </StaggerItem>

          <StaggerItem>
            <HoverCard>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatedButton asChild variant="outline" className="w-full">
                    <Link href="/staff/prices">Update Prices</Link>
                  </AnimatedButton>
                  <AnimatedButton asChild variant="outline" className="w-full">
                    <Link href="/staff/products">Add Product</Link>
                  </AnimatedButton>
                </CardContent>
              </Card>
            </HoverCard>
          </StaggerItem>
        </div>
      </StaggerAnimation>
    </div>
  );
}

