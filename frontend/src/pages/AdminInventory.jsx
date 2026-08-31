import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Plus,
  Minus,
  Trash2,
  RotateCcw,
  RefreshCw,
  Database
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

import { getProductTypes, PRODUCT_TYPES as PRODUCT_TYPES_CONFIG } from "../config/designPreferences";

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

// Standard sizes
const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"];

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

  // Modal states
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState("tshirt");
  const [selectedColor, setSelectedColor] = useState("black");
  const [stockInputs, setStockInputs] = useState({});
  const [savingBulk, setSavingBulk] = useState(false);

  const token =
    localStorage.getItem("token");

  // Product types from designPreferences (with localStorage overrides)
  // Use getProductTypes for dynamic colors, but also keep static config for dropdown iteration
  const productTypesData = useMemo(() => getProductTypes(), []);
  const productTypesArray = useMemo(() => Object.values(productTypesData), []);

  const fetchProducts =
    async () => {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const res =
          await API.get("/admin/products", {
            headers: getAdminHeaders(),
            signal: controller.signal
          });
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
        const status = err?.response?.status;
        const message = err?.response?.data?.error || err.message;
        const isTimeout = err.name === 'AbortError' || err.code === 'ECONNABORTED';

        console.log(
          "Inventory Products Error:",
          { status, message, isTimeout, stack: err.stack }
        );

        if (isTimeout) {
          console.warn("Request timed out - falling back to demo data.");
          showError("Request timed out. Showing demo data.");
        } else if (status === 403) {
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

  // Fetch from new inventory endpoint (grouped by type + color)
  const fetchInventory = async () => {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const res = await API.get("/admin/inventory", {
        headers: getAdminHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      // Handle 304 Not Modified - data may be in res.data or need fallback
      if (res.data?.products) {
        const normalizedProducts = res.data.products.map(p => ({
          ...p,
          variants: Array.isArray(p.variants) ? p.variants : [],
          price: p.price || 0,
          name: p.name || p.prompt || "Unnamed",
          image: p.image || p.imageUrl || ""
        }));
        setProducts(normalizedProducts);
        setUsingMockData(res.data.usingMockData || false);
      } else if (res.status === 304) {
        // 304 - cached response, keep existing products (don't reset)
        console.log("304 Not Modified - using cached data");
      } else {
        // No products in response, fallback
        await fetchProducts();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.log("Fetch inventory error:", err);
      // Fallback to products endpoint
      await fetchProducts();
    } finally {
      // Ensure loading is always reset
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Summary stats - must be before early return to maintain consistent hook count
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center gap-4 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
        <p className="text-lg">Loading Inventory…</p>
        <p className="text-sm text-zinc-500">If this takes too long, check your connection or admin access.</p>
      </main>
    );
  }

  const handleStockChange =
    async (productId, color, size, newQty) => {
      const key = `${productId}::${color}::${size}`;
      setSaving(key);
      const loadingToast = showLoading("Saving stock…");
      try {
        await new Promise((r) => setTimeout(r, 200)); // tiny debounce feel
        setStock(productId, color, size, newQty);
        dismissToast(loadingToast);
        showSuccess("Stock updated (local override)");
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

  // Sync local override to backend
  const syncToBackend = async (productId, color, size, quantity) => {
    // Find the product type from the product
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const productType = product.category || "tshirt";
    try {
      await API.put("/admin/inventory/stock", {
        productType,
        color: color.toLowerCase(),
        size: size.toUpperCase(),
        stock: quantity
      }, { headers: getAdminHeaders() });
      return true;
    } catch (err) {
      console.error("Sync to backend failed:", err);
      return false;
    }
  };

  // Open add stock modal
  const openAddStockModal = (productType = "tshirt", color = "black") => {
    setSelectedProductType(productType);
    setSelectedColor(color);
    // Initialize stock inputs for all standard sizes
    const inputs = {};
    STANDARD_SIZES.forEach(size => {
      inputs[size] = 0;
    });
    setStockInputs(inputs);
    setShowAddStock(true);
  };

  // Handle bulk stock save to backend
  const handleBulkStockSave = async () => {
    setSavingBulk(true);
    const loadingToast = showLoading("Saving stock to backend…");
    try {
      const sizes = Object.entries(stockInputs)
        .filter(([, stock]) => stock > 0)
        .map(([size, stock]) => ({ size, stock: Number(stock) }));

      if (sizes.length === 0) {
        showError("Please enter stock for at least one size");
        return;
      }

      await API.post("/admin/inventory/stock", {
        productType: selectedProductType,
        color: selectedColor,
        sizes
      }, { headers: getAdminHeaders() });

      dismissToast(loadingToast);
      showSuccess("Stock saved to backend!");
      setShowAddStock(false);
      // Refresh inventory
      await fetchInventory();
    } catch (err) {
      dismissToast(loadingToast);
      showError(err.response?.data?.error || err.message || "Failed to save stock");
    } finally {
      setSavingBulk(false);
    }
  };

  // Add new color to product type (also creates stock entries)
  const handleAddColor = async (productType, color) => {
    try {
      const sizes = STANDARD_SIZES.map(size => ({ size, stock: 10 }));
      await API.post("/admin/inventory/color", {
        productType,
        color,
        sizes
      }, { headers: getAdminHeaders() });
      showSuccess(`Color "${color}" added with default stock (10 per size)`);
      await fetchInventory();
    } catch (err) {
      showError(err.response?.data?.error || err.message || "Failed to add color");
    }
  };

  // Get colors for a product type (including custom from localStorage)
  const getColorsForProductType = (productType) => {
    const types = getProductTypes();
    return types[productType]?.colors?.map(c => c.id) || [];
  };

  // Remove color from product type
  const handleRemoveColor = async (productType, color) => {
    if (!window.confirm(`Remove color "${color}" from ${productType}? This will delete all size variants.`)) return;
    try {
      await API.delete("/admin/inventory/color", {
        data: { productType, color },
        headers: getAdminHeaders()
      });
      showSuccess(`Color "${color}" removed`);
      await fetchInventory();
    } catch (err) {
      showError(err.response?.data?.error || err.message || "Failed to remove color");
    }
  };

  // Refresh from backend
  const handleRefresh = async () => {
    const loadingToast = showLoading("Refreshing from backend…");
    try {
      await fetchInventory();
      dismissToast(loadingToast);
      showSuccess("Refreshed from backend");
    } catch (err) {
      dismissToast(loadingToast);
      showError("Refresh failed");
    }
  };

  // Get unique product types and colors from products
  const availableProductTypes = useMemo(() => {
    const types = new Set(products.map(p => p.category || "tshirt"));
    return Array.from(types);
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach(p => {
      (p.variants || []).forEach(v => colors.add(v.color.toLowerCase()));
    });
    return Array.from(colors);
  }, [products]);

  return (
    <ErrorBoundary>
    <main className="min-h-screen bg-[#0b0b0b] text-white px-4 py-20 md:p-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-cyan-300 mb-2">AIWear Admin</p>
            <h1 className="text-3xl font-semibold">Inventory Management</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Manage stock per variant (product type × color × size). Local overrides apply instantly; sync to backend to persist.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="rounded-2xl border border-[#333] px-4 py-2 text-sm text-zinc-300 hover:bg-[#1a1a1a] flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => openAddStockModal()}
              className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-medium text-black flex items-center gap-2"
            >
              <Plus size={16} />
              Add Stock
            </button>
          </div>
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
        <div className="grid gap-3 sm:grid-cols-4 mb-6">
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
          <div className="rounded-2xl border border-[#2f2f2f] bg-[#171717] p-4">
            <p className="text-xs text-zinc-400">Product Types</p>
            <p className="mt-1 text-3xl font-bold">{availableProductTypes.length}</p>
          </div>
        </div>

        {/* Products list */}
        {products.length === 0 ? (
          <div className="rounded-3xl border border-[#2f2f2f] bg-[#171717] p-12 text-center text-zinc-500">
            No products found. Click "Add Stock" to create inventory.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              try {
                const productLabel = product?.name || product?.prompt || "Unnamed";
                const productImage = product?.image || product?.imageUrl || "";
                const variants = Array.isArray(product?.variants) ? product.variants : [];

                if (!product?._id || variants.length === 0) return null;

                // Group variants by color
                const colorsMap = {};
                variants.forEach(v => {
                  const c = v.color.toLowerCase();
                  if (!colorsMap[c]) colorsMap[c] = [];
                  colorsMap[c].push(v);
                });

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
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium truncate">{productLabel}</h2>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-400 px-2 py-1 rounded bg-[#0f0f0f] border border-[#333]">
                              Type: {product.category || "tshirt"}
                            </span>
                            <button
                              onClick={() => openAddStockModal(product.category || "tshirt")}
                              className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-400 hover:bg-cyan-500/20 flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Color Stock
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">Price: ₹{product.price || 999}</p>

                        {/* Colors grid */}
                        <div className="mt-4 space-y-4">
                          {Object.entries(colorsMap).map(([color, colorVariants]) => (
                            <div key={color} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded-full border border-[#333]"
                                    style={{ backgroundColor: color === "white" ? "#fff" : color === "black" ? "#000" : color === "red" ? "#dc2626" : color === "blue" ? "#1e3a5f" : color }} />
                                  <span className="font-medium capitalize">{color}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveColor(product.category || "tshirt", color)}
                                  className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                                  title={`Remove color ${color}`}
                                >
                                  <Trash2 size={12} />
                                  Remove
                                </button>
                              </div>

                              {/* Variants grid for this color */}
                              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                                {STANDARD_SIZES.map(size => {
                                  const variant = colorVariants.find(v => v.size.toUpperCase() === size);
                                  const backendStock = variant?.stock || 0;
                                  const effStock = getEffectiveStock(
                                    product._id,
                                    color,
                                    size,
                                    backendStock
                                  );
                                  const hasOverride = effStock !== backendStock;
                                  const isLow = effStock > 0 && effStock <= 3;
                                  const isOut = effStock <= 0;
                                  const savingThis = saving === `${product._id}::${color}::${size}`;

                                  return (
                                    <div
                                      key={`${product._id}-${color}-${size}`}
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
                                        <span className="text-xs uppercase tracking-wide text-zinc-400">{size}</span>
                                        {hasOverride && (
                                          <span className="text-xs text-cyan-400">Overridden</span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-zinc-500 w-14">Stock</span>

                                        <div className="flex items-center gap-1 flex-1">
                                          <button
                                            onClick={() =>
                                              handleQuickAdjust(
                                                product._id,
                                                color,
                                                size,
                                                backendStock,
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
                                                color,
                                                size,
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
                                                color,
                                                size,
                                                backendStock,
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
                                                  color,
                                                  size
                                                )
                                              }
                                              className="ml-1 rounded-lg border border-[#333] p-1.5 text-zinc-500 hover:text-white"
                                              title="Remove override"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <p className="mt-1 text-xs text-zinc-500">
                                        Backend: {backendStock}
                                        {hasOverride && " · Overridden"}
                                      </p>
                                    </div>
                                  );
                                })}

                                {/* Add size button - placeholder for sizes not yet created */}
                                {colorVariants.length < STANDARD_SIZES.length && (
                                  <button
                                    onClick={() => openAddStockModal(product.category || "tshirt", color)}
                                    className="rounded-xl border-2 border-dashed border-[#333] p-3 text-zinc-500 hover:border-cyan-500 hover:text-cyan-400 flex flex-col items-center gap-1"
                                  >
                                    <Plus size={20} />
                                    <span className="text-xs">Add Sizes</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
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

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-[#2f2f2f] bg-[#171717] p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add/Update Stock for Backend</h3>
              <button
                onClick={() => setShowAddStock(false)}
                className="rounded-lg p-2 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs text-zinc-400">Product Type</span>
                  <select
                    value={selectedProductType}
                    onChange={(e) => setSelectedProductType(e.target.value)}
                    className="mt-1 w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
                  >
                    {productTypesArray.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs text-zinc-400">Color</span>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="mt-1 w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
                  >
                    {productTypesData[selectedProductType]?.colors?.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="text-sm text-zinc-400">
                Enter stock quantities for each size. Sizes with 0 will not be created.
              </p>

              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                {STANDARD_SIZES.map(size => (
                  <label key={size} className="block">
                    <span className="text-xs text-zinc-400 block mb-1">{size}</span>
                    <input
                      type="number"
                      min="0"
                      value={stockInputs[size] || 0}
                      onChange={(e) => setStockInputs(prev => ({ ...prev, [size]: Number(e.target.value) || 0 }))}
                      className="w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none text-center text-lg"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#2f2f2f]">
              <button
                onClick={() => setShowAddStock(false)}
                className="flex-1 rounded-2xl border border-[#333] px-4 py-3 text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStockSave}
                disabled={savingBulk}
                className="flex-1 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-black disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingBulk && <span className="animate-spin">⏳</span>}
                {savingBulk ? "Saving…" : "Save to Backend"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
    </ErrorBoundary>
  );
}