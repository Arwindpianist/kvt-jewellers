"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoldPrice } from "@/types/gold-prices";

interface PriceManagerProps {
  initialPrices: GoldPrice[];
}

const priceTypeLabels: Record<string, string> = {
  GOLD_C: "GOLD - C",
  GOLD_USD: "GOLD ($)",
  SILVER_C: "SILVER - C",
  SILVER_USD: "SILVER ($)",
  SING: "SING",
};

export function PriceManager({ initialPrices }: PriceManagerProps) {
  const [prices, setPrices] = useState(initialPrices);
  const [editing, setEditing] = useState<Record<string, { overridePrice?: number; isPublished: boolean }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleEdit = (priceId: string) => {
    const price = prices.find((p) => p.id === priceId);
    if (price) {
      setEditing({
        ...editing,
        [priceId]: {
          overridePrice: price.overridePrice,
          isPublished: price.isPublished,
        },
      });
    }
  };

  const handleSave = async (priceId: string) => {
    setSaving(priceId);
    const editData = editing[priceId];

    try {
      const response = await fetch("/api/gold-prices/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          overridePrice: editData?.overridePrice,
          isPublished: editData?.isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update price");
      }

      const data = await response.json();
      setPrices(data.prices);
      const newEditing = { ...editing };
      delete newEditing[priceId];
      setEditing(newEditing);
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = (priceId: string) => {
    const newEditing = { ...editing };
    delete newEditing[priceId];
    setEditing(newEditing);
  };

  const displayPrice = (price: GoldPrice) => {
    return price.overridePrice ?? price.fetchedPrice;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currency === "MYR" ? "MYR" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gold Price Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Fetched Price</TableHead>
              <TableHead>Override Price</TableHead>
              <TableHead>Display Price</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((price) => {
              const isEditing = editing[price.id] !== undefined;
              const editData = editing[price.id];

              return (
                <TableRow key={price.id}>
                  <TableCell className="font-medium">
                    {priceTypeLabels[price.type] || price.type}
                  </TableCell>
                  <TableCell>
                    {formatPrice(price.fetchedPrice, price.currency)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={editData?.overridePrice ?? price.overridePrice ?? ""}
                        onChange={(e) => {
                          setEditing({
                            ...editing,
                            [price.id]: {
                              ...editData,
                              overridePrice: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            },
                          });
                        }}
                        className="w-32"
                        placeholder="Auto"
                      />
                    ) : (
                      <span className="text-muted-foreground">
                        {price.overridePrice
                          ? formatPrice(price.overridePrice, price.currency)
                          : "Auto"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-brand-600">
                    {formatPrice(displayPrice(price), price.currency)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editData?.isPublished ?? price.isPublished}
                          onChange={(e) => {
                            setEditing({
                              ...editing,
                              [price.id]: {
                                ...editData,
                                isPublished: e.target.checked,
                              },
                            });
                          }}
                        />
                        <span className="text-sm">
                          {editData?.isPublished ?? price.isPublished
                            ? "Published"
                            : "Unpublished"}
                        </span>
                      </label>
                    ) : (
                      <span
                        className={
                          price.isPublished
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        {price.isPublished ? "Published" : "Unpublished"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(price.id)}
                          disabled={saving === price.id}
                        >
                          {saving === price.id ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(price.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(price.id)}>
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Override prices will replace fetched prices on the public site.
            Unpublished prices will not be visible to customers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

