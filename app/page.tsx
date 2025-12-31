import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home");
}

export const metadata = {
  title: "KVT Jewellers | Premium Gold and Silver Trading",
  description: "Premium gold and silver jewelry, coins, and bullion in Malaysia",
};

