/**
 * Memory-Safe In-App Price Engine
 *
 * A singleton, in-place-updating price engine that avoids memory leaks caused by:
 * - Multiple setInterval timers running (each holds closures and references).
 * - Allocating new arrays or objects every tick (GC pressure, retained old objects).
 * - Storing historical prices or snapshots (unbounded growth).
 *
 * PATTERNS THAT PREVENT LEAKS:
 *
 * 1. Singleton interval
 *    Only one setInterval runs per process. startPriceEngine clears any existing
 *    interval before starting a new one, so duplicate calls do not create
 *    duplicate timers. This avoids multiple timers holding references and
 *    prevents intervals from stacking on HMR.
 *
 * 2. In-place mutation
 *    We keep a single Record<string, ProductPrice> and only mutate the `price`
 *    property of each object on each tick. We do not create new ProductPrice
 *    objects, new arrays, or new Records. This avoids repeated allocations
 *    in the 2-second loop and reduces GC work.
 *
 * 3. No history
 *    We do not push to arrays or store old snapshots. The store holds only
 *    the current state.
 *
 * 4. HMR cleanup
 *    On module load we clear any interval stored in globalThis. In Next.js
 *    dev, module reload can leave the old interval running; clearing it
 *    prevents duplicate timers and leaks across hot reloads.
 */

export type ProductPrice = { id: string; price: number };

const INTERVAL_MS = 2000;
/** ±0.5% random adjustment per tick. Applied in-place to each price. */
const RANDOM_RANGE = 0.005;

const GLOBAL_INTERVAL_KEY = "__PRICE_ENGINE_INTERVAL__";

/** Single in-place store: id -> ProductPrice. We mutate only .price on each tick. */
let store: Record<string, ProductPrice> = {};

/** The one interval. Cleared before starting a new one (singleton). */
let intervalId: ReturnType<typeof setInterval> | null = null;

// On module load (e.g. HMR): clear any existing interval from a previous
// module instance. Ensures no duplicate timers after hot reload.
if (typeof globalThis !== "undefined") {
  const existing = (globalThis as Record<string, unknown>)[GLOBAL_INTERVAL_KEY];
  if (existing != null) {
    clearInterval(existing as ReturnType<typeof setInterval>);
  }
  (globalThis as Record<string, unknown>)[GLOBAL_INTERVAL_KEY] = undefined;
}

/**
 * Tick: apply random adjustment to each price in place.
 * No new objects or arrays; only numeric mutation of obj.price.
 */
function tick(): void {
  for (const id in store) {
    const obj = store[id];
    if (!obj || typeof obj.price !== "number") continue;
    const delta = (Math.random() * 2 - 1) * RANDOM_RANGE * obj.price;
    obj.price = obj.price + delta;
  }
}

/**
 * Starts the price engine safely. Handles multiple calls by clearing any
 * existing interval and reinitializing from initialPrices (one interval only).
 * Safe to call from server or client; one interval per process.
 *
 * @param initialPrices - ProductPrice objects to track. We reuse these
 *   references in the store; we do not copy them. Duplicate ids: last wins.
 */
export function startPriceEngine(initialPrices: ProductPrice[]): void {
  // Singleton: clear any existing interval so only one runs.
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (typeof globalThis !== "undefined") {
    const g = (globalThis as Record<string, unknown>)[GLOBAL_INTERVAL_KEY];
    if (g != null) {
      clearInterval(g as ReturnType<typeof setInterval>);
      (globalThis as Record<string, unknown>)[GLOBAL_INTERVAL_KEY] = undefined;
    }
  }

  // Build store from initial prices. We reuse the objects from the array
  // (no new ProductPrice allocations). Duplicate ids: last wins.
  store = {};
  for (let i = 0; i < initialPrices.length; i++) {
    const p = initialPrices[i];
    if (p != null && p.id != null) store[p.id] = p;
  }

  intervalId = setInterval(tick, INTERVAL_MS);
  if (typeof globalThis !== "undefined") {
    (globalThis as Record<string, unknown>)[GLOBAL_INTERVAL_KEY] = intervalId;
  }
}

/**
 * Returns the latest prices. This is the live store; avoid mutating it or
 * the nested ProductPrice objects so the in-place engine remains consistent.
 */
export function getPrices(): Record<string, ProductPrice> {
  return store;
}
