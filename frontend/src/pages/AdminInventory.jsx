import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Plus,
  Minus,
  Trash2
} from "lucide-react";

import ErrorBoundary from "../components/ErrorBoundary";

import API from "../api";

import {
  getEffectiveStock,
  getAllOverrides,
  setStock,
  removeStock
} from "../utils/inventoryStore";

import {
  showSuccess,
  showError,
  showLoading,
  dismissToast
} from "../utils/toast";

import {
  getAdminHeaders
} from "../utils/adminHeaders";

// Mock products for graceful fallback
const MOCK_INVENTORY_PRODUCTS = [
  {
    _id: "mock-inv-1",
    name: "Classic Cotton T-Shirt",
    variants: [
      { color: "Black", size: "S", stock: 12 },
      { color: "Black", size: "M", stock: 8 },
      { color: "White", size: "L", stock: 15 },
      { color: "Navy", size: "XL", stock: 0 }
    ]
  },
  {
    _id: "mock-inv-2",
    name: "Oversized Hoodie",
    variants: [
      { color: "Grey", size: "M", stock: 5 },
      { color: "Grey", size: "L", stock: 3 },
      { color: "Black", size: "XL", stock: 2 }
    ]
  }
];

export default function AdminInventory() {

  const [products,
    setProducts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [usingMockData,
    setUsingMockData] =
    useState(false);

  const [saving,
    setSaving] =
    useState(null); // variantKey being saved

  const token =
    localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const fetchProducts =
    async () => {
      try {
        const res =
          await API.get("/admin/products", { headers: getAdminHeaders() });
        // Ensure we get an array and each product has variants array
        const products = Array.isArray(res.data) ? res.data : [];
        const normalizedProducts = products.map(p => ({
          ...p,
          variants: Array.isArray(p.variants) ? p.variants : [],
          price: p.price || 0,
          name: p.name || p.prompt || "Unnamed",
          image: p.image || p.imageUrl || ""
        }));
        setProducts(normalizedProducts);
        setUsingMockData(false);
      } catch (err) {
        const status = err?.response?.status;
        const message = err?.response?.data?.error || err.message;

        console.log(
          "Inventory Products Error:",
          { status, message, stack: err.stack }
        );

        if (status === 403) {
          console.warn("Admin access denied (403) - falling back to demo data.");
          showError("Admin access required. Showing demo data.");
        } else if (status === 401) {
          console.warn("Session expired (401) - falling back to demo data.");
          showError("Session expired. Showing demo data.");
        } else {
          console.warn("Failed to load products - falling back to demo data.", { status, message });
          showError("Failed to load products. Showing demo data.");
        }

        setProducts(MOCK_INVENTORY_PRODUCTS);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center text-2xl">
        Loading Inventory…
      </main>
    );
  }

  // Summary stats
  const stats =
    useMemo(() => {
      let totalVariants = 0;
      let lowStock = 0;
      let outOfStock = 0;

      products.forEach((product) => {
        if (!product?._id) return;
        (product.variants || []).forEach((variant) => {
          totalVariants++;
          const eff = getEffectiveStock(product._id, variant?.color, variant?.size, variant?.stock || 0);
          if (eff <= 0) outOfStock++;
          else if (eff <= 3) lowStock++;
        });
      });

      return { totalVariants, lowStock, outOfStock };
    }, [products]);

  const handleStockChange =
    async (productId, color, size, newQty) => {
      const key = `${productId}::${color}::${size}`;
      setSaving(key);
      const loadingToast = showLoading("Saving stock…");
      try {
        await new Promise((r) => setTimeout(r, 200)); // tiny debounce feel
        setStock(productId, color, size, newQty);
        dismissToast(loadingToast);
        showSuccess("Stock updated");
      } catch (err) {
        dismissToast(loadingToast);
        showError(err.message || "Save failed");
      } finally {
        setSaving(null);
      }
    };

  const handleQuickAdjust =
    (productId, color, size, backendStock, delta) => {
      const current = getEffectiveStock(productId, color, size, backendStock);
      handleStockChange(productId, color, size, Math.max(0, current + delta));
    };

  const handleRemoveOverride =
    (productId, color, size) => {
      removeStock(productId, color, size);
      showSuccess("Override removed");
    };

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-[#0b0b0b] text-white px-4 py-20 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <p className="text-sm text-cyan-300 mb-2">AIWear Admin</p>
          <h1 className="text-3xl font-semibold">Inventory Management</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Edit stock per variant. Overrides are stored locally and applied
            instantly — no backend migration needed.
          </p>
        </div>

        {/* Mock Data Banner */}
        {
          usingMockData && (
            <div
              className="
                mb-6
                p-4
                bg-amber-500/15
                border
                border-amber-500/40
                rounded-2xl
                text-amber-300
                flex
                items-center
                gap-3
              "
            >
              <span className="font-medium">Demo Mode:</span>
              <span>Showing sample inventory. Log in as an admin user to manage real stock.</span>
            </div>
          )
        }

        {/* Summary */}
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4">
            <p className="text-xs text-zinc-400">Total Variants</p>
            <p className="mt-1 text-3xl font-bold">{stats.totalVariants}</p>
          </div>
          <div className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4">
            <p className="text-xs text-zinc-400">Low Stock (≤3)</p>
            <p className="mt-1 text-3xl font-bold text-yellow-400">{stats.lowStock}</p>
          </div>
          <div className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4">
            <p className="text-xs text-zinc-400">Out of Stock</p>
            <p className="mt-1 text-3xl font-bold text-red-400">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Products list */}
        {products.length === 0 ? (
          <div className="rounded-3xl border border-[#2f2f2f] bg-[#171717] p-12 text-center text-zinc-500">
            No products found.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              try {
                const productLabel = product?.name || product?.prompt || "Unnamed";
                const productImage = product?.image || product?.imageUrl || "";
                const variants = Array.isArray(product?.variants) ? product.variants : [];

                if (!product?._id || variants.length === 0) return null;

                return (
                  <article
                    key={product._id}
                    className="rounded-3xl border border-[#2f2f2f] bg-[#171717] overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
                      {/* Thumbnail */}
                      <div className="relative h-32 w-32 md:h-40 md:w-40 flex-shrink-0 rounded-xl overflow-hidden border border-[#2f2f2f] bg-[#101010]">
                        {productImage ? (
                          <img src={productImage} alt={productLabel} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-500">No image</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-medium truncate">{productLabel}</h2>
                        <p className="mt-1 text-sm text-zinc-400">Price: ₹{product.price || 999}</p>

                        {/* Variants grid */}
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {variants.map((variant, idx) => {
                            try {
                              const effStock = getEffectiveStock(
                                product._id,
                                variant?.color,
                                variant?.size,
                                variant?.stock || 0
                              );
                              const hasOverride = getEffectiveStock(
                                product._id,
                                variant?.color,
                                variant?.size,
                                variant?.stock || 0
                              ) !== (variant?.stock || 0);

                              const isLow = effStock > 0 && effStock <= 3;
                              const isOut = effStock <= 0;
                              const savingThis = saving === `${product._id}::${variant?.color}::${variant?.size}`;

                              return (
                                <div
                                  key={`${product._id}-${idx}`}
                                  className={`
                                    rounded-xl border p-3 text-sm
                                    ${isOut
                                      ? "border-red-500 bg-red-500/10 text-red-300"
                                      : isLow
                                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                                        : "border-[#2f2f2f] bg-[#121212] text-zinc-300"}
                                  `}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="font-medium truncate">{variant?.color || "N/A"}</span>
                                    <span className="text-xs uppercase tracking-wide">{variant?.size || "N/A"}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500 w-16">Stock</span>

                                    <div className="flex items-center gap-1 flex-1">
                                      <button
                                        onClick={() =>
                                          handleQuickAdjust(
                                            product._id,
                                            variant?.color,
                                            variant?.size,
                                            variant?.stock || 0,
                                            -1
                                          )
                                        }
                                        disabled={savingThis}
                                        className="rounded-lg bg-[#0f0f0f] border border-[#333] px-2 py-1 text-xs hover:bg-[#222] disabled:opacity-50"
                                      >
                                        <Minus size={12} />
                                      </button>

                                      <input
                                        type="number"
                                        min="0"
                                        value={effStock}
                                        onChange={(e) =>
                                          handleStockChange(
                                            product._id,
                                            variant?.color,
                                            variant?.size,
                                            Number(e.target.value)
                                          )
                                        }
                                        disabled={savingThis}
                                        className="w-16 rounded-lg bg-[#0f0f0f] border border-[#333] px-2 py-1 text-center text-sm outline-none disabled:opacity-50"
                                      />

                                      <button
                                        onClick={() =>
                                          handleQuickAdjust(
                                            product._id,
                                            variant?.color,
                                            variant?.size,
                                            variant?.stock || 0,
                                            +1
                                          )
                                        }
                                        disabled={savingThis}
                                        className="rounded-lg bg-[#0f0f0f] border border-[#333] px-2 py-1 text-xs hover:bg-[#222] disabled:opacity-50"
                                      >
                                        <Plus size={12} />
                                      </button>

                                      {hasOverride && (
                                        <button
                                          onClick={() =>
                                            handleRemoveOverride(
                                              product._id,
                                              variant?.color,
                                              variant?.size
                                            )
                                          }
                                          className="ml-2 rounded-lg border border-[#333] p-1.5 text-zinc-500 hover:text-white"
                                          title="Remove override"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="mt-1 text-xs text-zinc-500">
                                    Backend: {variant?.stock || 0}
                                    {hasOverride && " · Overridden"}
                                  </p>
                                </div>
                              );
                            } catch (variantErr) {
                              console.error("Variant render error:", variantErr);
                              return null;
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              } catch (productErr) {
                console.error("Product render error:", productErr);
                return null;
              }
            })}
          </div>
        )}

      </div>

    </main>
    </ErrorBoundary>
  );
}