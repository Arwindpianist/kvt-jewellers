"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedTableRow } from "@/components/public/AnimatedTable";

interface ProductRate {
  id: string;
  description: string;
  flag: string;
  buy: number;
  sell: number;
}

interface ProductRatesTableProps {
  products?: ProductRate[];
}

const defaultProducts: ProductRate[] = [
  { id: "1", description: "GOLD 1 KG / MYR", flag: "🇲🇾", buy: 565043.30, sell: 570843.35 },
  { id: "2", description: "100 GM CASTING GOLD BAR", flag: "🇲🇾", buy: 56704.30, sell: 57405.35 },
  { id: "3", description: "916 RETAIL / TRADE IN PRICE", flag: "🇲🇾", buy: 493.00, sell: 560.00 },
  { id: "4", description: "916 CASH PURCHASE RATE", flag: "🇲🇾", buy: 493, sell: 560 },
  { id: "5", description: "835 GOLD", flag: "🪙", buy: 394.00, sell: 500.00 },
  { id: "6", description: "750 Gold", flag: "🇲🇾", buy: 341.00, sell: 455.00 },
  { id: "7", description: "SILVER 1KG / MYR", flag: "🇲🇾", buy: 9304.85, sell: 10934.95 },
];

export function ProductRatesTable({ products = defaultProducts }: ProductRatesTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-brand-500 text-white">
            <TableHead className="text-white">Description</TableHead>
            <TableHead className="text-right text-white">Buy</TableHead>
            <TableHead className="text-right text-white">Sell</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <AnimatedTableRow key={product.id} index={index}>
              <TableCell className="font-medium">
                <span className="mr-2">{product.flag}</span>
                {product.description}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatPrice(product.buy)}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatPrice(product.sell)}
              </TableCell>
            </AnimatedTableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

