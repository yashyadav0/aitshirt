import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Image as ImageIcon,
  Trash2,
  Upload,
  RotateCcw,
  Plus,
  X
} from "lucide-react";

import API from "../api";

import {
  getMockup,
  listMockupSlots,
  getOverride,
  setOverride,
  removeOverride,
  listOverrides
} from "../config/mockups";

import {
  PRODUCT_TYPES
} from "../config/designPreferences";

import {
  showSuccess,
  showError,
  showLoading,
  dismissToast
} from "../utils/toast";

export default function AdminMockups() {

  const [slots] =
    useState(() => listMockupSlots());

  const [selected,
    setSelected] =
    useState(() => {
      const first = listMockupSlots()[0];
      return first
        ? { productType: first.productType, color: first.color, side: "front" }
        : { productType: "tshirt", color: "white", side: "front" };
    });

  const [overrides,
    setOverrides] =
    useState(() => listOverrides());

  const [uploading,
    setUploading] =
    useState(false);

  // Add color modal state
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorId, setNewColorId] = useState("");
  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [addingColor, setAddingColor] = useState(false);

  const token =
    localStorage.getItem("token");

  const refreshOverrides = () =>
    setOverrides(listOverrides());

  const colors =
    PRODUCT_TYPES[selected.productType]?.colors || [];

  const currentUrl =
    getMockup(selected.productType, selected.color, selected.side);

  const hasOverride =
    Boolean(getOverride(selected.productType, selected.color, selected.side));

  const previewSrc =
    useMemo(() => currentUrl, [currentUrl]);

  const handleUpload =
    async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      setUploading(true);
      const loadingToast =
        showLoading("Uploading mockup…");

      try {
        const form = new FormData();
        form.append("image", file);

        const res =
          await API.post(
            "/upload",
            form,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              }
            }
          );

        const imageUrl =
          res.data?.imageUrl;

        if (!imageUrl) {
          throw new Error("Upload did not return an image URL.");
        }

        setOverride(
          selected.productType,
          selected.color,
          selected.side,
          imageUrl
        );

        refreshOverrides();
        dismissToast(loadingToast);
        showSuccess("Mockup updated");
      } catch (err) {
        dismissToast(loadingToast);
        showError(
          err?.response?.data?.error ||
          err.message ||
          "Upload failed"
        );
      } finally {
        setUploading(false);
      }
    };

  const handleRemove =
    () => {
      removeOverride(
        selected.productType,
        selected.color,
        selected.side
      );
      refreshOverrides();
      showSuccess("Reverted to default mockup");
    };

  // Add new color to product type (stored in localStorage)
  const handleAddColor = async () => {
    if (!newColorId.trim() || !newColorLabel.trim()) {
      showError("Color ID and Label are required");
      return;
    }

    // Check if color already exists
    const exists = colors.some(c => c.id === newColorId.toLowerCase());
    if (exists) {
      showError("Color already exists for this product type");
      return;
    }

    setAddingColor(true);
    try {
      // Add to PRODUCT_TYPES in localStorage
      const stored = localStorage.getItem("productTypesOverride");
      const overrides = stored ? JSON.parse(stored) : {};

      if (!overrides[selected.productType]) {
        overrides[selected.productType] = { ...PRODUCT_TYPES[selected.productType] };
      }

      overrides[selected.productType].colors = [
        ...overrides[selected.productType].colors,
        { id: newColorId.toLowerCase(), label: newColorLabel, hex: newColorHex }
      ];

      localStorage.setItem("productTypesOverride", JSON.stringify(overrides));

      // Force refresh by re-reading
      setShowAddColor(false);
      setNewColorId("");
      setNewColorLabel("");
      setNewColorHex("#000000");
      showSuccess(`Color "${newColorLabel}" added. Refresh page to see in selector.`);
    } catch (err) {
      showError(err.message || "Failed to add color");
    } finally {
      setAddingColor(false);
    }
  };

  // Remove color from product type (only custom added colors)
  const handleRemoveColor = (colorId) => {
    // Can't remove default colors
    const defaultColors = PRODUCT_TYPES[selected.productType]?.colors || [];
    const isDefault = defaultColors.some(c => c.id === colorId);
    if (isDefault) {
      showError("Cannot remove default colors");
      return;
    }

    const stored = localStorage.getItem("productTypesOverride");
    if (!stored) return;

    const overrides = JSON.parse(stored);
    if (overrides[selected.productType]) {
      overrides[selected.productType].colors = overrides[selected.productType].colors
        .filter(c => c.id !== colorId);
      localStorage.setItem("productTypesOverride", JSON.stringify(overrides));
      showSuccess("Color removed. Refresh page to update selector.");
    }
  };

  // Track selection change so preview updates even when override removed.
  useEffect(() => {
    refreshOverrides();
  }, [selected.productType, selected.color, selected.side]);

  // Merge default and custom colors for display
  const allColors = useMemo(() => {
    const stored = localStorage.getItem("productTypesOverride");
    if (!stored) return colors;
    try {
      const overrides = JSON.parse(stored);
      const custom = overrides[selected.productType]?.colors || [];
      // Deduplicate by id, custom overrides default
      const map = new Map();
      [...colors, ...custom].forEach(c => map.set(c.id, c));
      return Array.from(map.values());
    } catch {
      return colors;
    }
  }, [colors, selected.productType]);

  return (

    <main
      className="
        min-h-screen
        bg-[#0b0b0b]
        text-white
        px-4
        py-20
        md:p-8
      "
    >

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <p className="text-sm text-cyan-300 mb-2">
            AIWear Admin
          </p>
          <h1 className="text-3xl font-semibold">
            Product Mockup Management
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Swap or add product color mockups. Add new colors per product type. Changes stored locally — no redeploy required.
          </p>
        </div>

        {/* Selector */}
        <section
          className="
            rounded-3xl
            border
            border-[#2f2f2f]
            bg-[#171717]
            p-4
            md:p-6
            mb-6
          "
        >

          <div className="grid gap-4 md:grid-cols-4">

            <label className="block">
              <span className="text-xs text-zinc-400">
                Product Type
              </span>
              <select
                value={selected.productType}
                onChange={(e) =>
                  setSelected((s) => ({
                    ...s,
                    productType: e.target.value,
                    color: PRODUCT_TYPES[e.target.value]?.colors[0]?.id || "white"
                  }))
                }
                className="mt-1 w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
              >
                {
                  Object.values(PRODUCT_TYPES).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))
                }
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-zinc-400">
                Color
              </span>
              <select
                value={selected.color}
                onChange={(e) =>
                  setSelected((s) => ({
                    ...s,
                    color: e.target.value
                  }))
                }
                className="mt-1 w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
              >
                {
                  allColors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                }
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-zinc-400">
                Side
              </span>
              <select
                value={selected.side}
                onChange={(e) =>
                  setSelected((s) => ({
                    ...s,
                    side: e.target.value
                  }))
                }
                className="mt-1 w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
              >
                <option value="front">Front</option>
                <option value="back">Back</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                onClick={() => setShowAddColor(true)}
                className="w-full rounded-2xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-3 text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Color
              </button>
            </div>

          </div>

        </section>

        {/* Preview + actions */}
        <section
          className="
            rounded-3xl
            border
            border-[#2f2f2f]
            bg-[#171717]
            p-4
            md:p-6
            mb-6
          "
        >

          <div className="grid gap-6 md:grid-cols-[260px_1fr]">

            <div
              className="
                relative
                aspect-square
                rounded-2xl
                border
                border-[#2f2f2f]
                bg-[#101010]
                overflow-hidden
              "
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="Mockup preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                  No mockup set
                </div>
              )}
              {hasOverride && (
                <span className="absolute left-2 top-2 rounded-full bg-cyan-500 px-2 py-1 text-xs font-medium text-black">
                  Custom
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center gap-4">

              <div>
                <h2 className="text-lg font-medium">
                  {
                    PRODUCT_TYPES[selected.productType]?.label
                  }{" "}
                  ·{" "}
                  {
                    allColors.find((c) => c.id === selected.color)?.label
                  }{" "}
                  ·{" "}
                  {selected.side}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {
                    hasOverride
                      ? "Showing your custom mockup. Remove it to revert to the default."
                      : "Showing the default mockup. Upload a new image to override it."
                  }
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">

                <label
                  className="
                    inline-flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-2xl
                    bg-cyan-500
                    px-5
                    py-3
                    font-medium
                    text-black
                  "
                >
                  <Upload size={18} />
                  {uploading ? "Uploading…" : "Upload Mockup"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>

                {hasOverride && (
                  <button
                    onClick={handleRemove}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      border-[#333]
                      px-5
                      py-3
                      text-zinc-300
                      hover:text-white
                    "
                  >
                    <RotateCcw size={18} />
                    Revert to Default
                  </button>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* Active overrides */}
        <section
          className="
            rounded-3xl
            border
            border-[#2f2f2f]
            bg-[#171717]
            p-4
            md:p-6
            mb-6
          "
        >

          <h2 className="mb-4 text-lg font-medium">
            Active Custom Mockups
            {overrides.length > 0 && (
              <span className="ml-2 text-sm text-zinc-400">
                ({overrides.length})
              </span>
            )}
          </h2>

          {
            overrides.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No custom mockups yet. Upload one above to get started.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">

                {
                  overrides.map((o) => {

                    const label =
                      `${PRODUCT_TYPES[o.productType]?.label || o.productType} ` +
                      `· ${o.color} · ${o.side}`;

                    return (

                      <article
                        key={`${o.productType}:${o.color}:${o.side}`}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-[#2f2f2f]
                          bg-[#121212]
                          p-3
                        "
                      >

                        <img
                          src={o.url}
                          alt={label}
                          className="h-16 w-16 rounded-xl object-cover border border-[#2f2f2f]"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {label}
                          </p>
                          <a
                            href={o.url}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-xs text-cyan-300 hover:underline"
                          >
                            View image
                          </a>
                        </div>

                        <button
                          onClick={() => {
                            removeOverride(o.productType, o.color, o.side);
                            refreshOverrides();
                          }}
                          className="
                            rounded-xl
                            border
                            border-[#333]
                            p-3
                            text-zinc-400
                            hover:text-white
                          "
                          title="Remove"
                        >
                          <Trash2 size={18} />
                        </button>

                      </article>
                    );
                  })
                }

              </div>
            )
          }

        </section>

        {/* Custom Colors for this product type */}
        <section
          className="
            rounded-3xl
            border
            border-[#2f2f2f]
            bg-[#171717]
            p-4
            md:p-6
          "
        >
          <h2 className="mb-4 text-lg font-medium flex items-center justify-between">
            Colors for {PRODUCT_TYPES[selected.productType]?.label}
            <span className="text-sm text-zinc-400 font-normal">(Custom colors persisted in localStorage)</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allColors.map((c) => {
              const isDefault = colors.some(dc => dc.id === c.id);
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border p-3 bg-[#121212] border-[#2f2f2f]"
                >
                  <span
                    className="h-8 w-8 rounded-full border-2 border-[#333] flex-shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.label}</p>
                    <p className="text-xs text-zinc-500 truncate">{c.id}</p>
                  </div>
                  {!isDefault && (
                    <button
                      onClick={() => handleRemoveColor(c.id)}
                      className="rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10"
                      title="Remove custom color"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
          <ImageIcon size={14} />
          Mockups are served from the selected (product · color · side) slot.
        </div>

      </div>

      {/* Add Color Modal */}
      {showAddColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#2f2f2f] bg-[#171717] p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Color</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Color ID (lowercase, no spaces)</label>
                <input
                  type="text"
                  value={newColorId}
                  onChange={(e) => setNewColorId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="e.g., navy, forest-green"
                  className="w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Color Label (display name)</label>
                <input
                  type="text"
                  value={newColorLabel}
                  onChange={(e) => setNewColorLabel(e.target.value)}
                  placeholder="e.g., Navy Blue, Forest Green"
                  className="w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Hex Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-[#333] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="flex-1 rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddColor(false)}
                className="flex-1 rounded-2xl border border-[#333] px-4 py-3 text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColor}
                disabled={addingColor}
                className="flex-1 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-black disabled:opacity-50"
              >
                {addingColor ? "Adding…" : "Add Color"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
