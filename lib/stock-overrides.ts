export function getStockOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem("stock_overrides_v1");
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function setStockOverride(productId: string, newStock: number) {
  try {
    const cur = getStockOverrides();
    cur[productId] = newStock;
    localStorage.setItem("stock_overrides_v1", JSON.stringify(cur));
  } catch {}
}

export function applyStockOverridesToProduct(product: any) {
  if (!product) return product;
  if (typeof window === "undefined") return product;
  const overrides = getStockOverrides();
  if (overrides[product.id] !== undefined) {
    const overridden = { ...product, stock: overrides[product.id] };
    if (overridden.stock <= 0) overridden.isActive = false;
    return overridden;
  }
  return product;
}
