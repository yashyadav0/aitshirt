import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import API from "../api";

export default function AdminPricing() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState(null);

  // Group pricing by product type for display
  const groupedPricing = pricing.reduce((acc, item) => {
    const type = item.productType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  const productTypes = ["tshirt", "hoodie", "oversized", "kids"];

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/pricing");
      if (res.data.success) {
        setPricing(res.data.pricing);
      }
    } catch (err) {
      console.error("FETCH PRICING ERROR:", err);
      setMessage({ type: "error", text: "Failed to load pricing" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key, price) => {
    try {
      setSaving(key);
      setMessage(null);
      await API.put(`/admin/pricing/${key}`, { price: Number(price) || 0 });
      setMessage({ type: "success", text: `Price updated for ${key}` });
    } catch (err) {
      console.error("UPDATE PRICING ERROR:", err);
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update price" });
    } finally {
      setSaving(null);
    }
  };

  const handleBulkSave = async () => {
    try {
      setSaving("bulk");
      setMessage(null);
      const prices = pricing.map(p => ({ key: p.key, price: Number(p.price) || 0 }));
      await API.put("/admin/pricing", { prices });
      setMessage({ type: "success", text: "All prices updated successfully" });
    } catch (err) {
      console.error("BULK UPDATE PRICING ERROR:", err);
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update prices" });
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Pricing Management</h1>
        <button
          onClick={fetchPricing}
          disabled={saving}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline" /> Refresh
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
          message.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
          "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-[#141414] border border-[#2f2f2f] rounded-2xl overflow-hidden">
        {productTypes.map((type) => {
          const items = groupedPricing[type] || [];
          if (items.length === 0) return null;

          return (
            <div key={type} className="border-t border-[#2f2f2f] first:border-t-0">
              <div className="px-6 py-4 bg-zinc-900/50 border-b border-[#2f2f2f]">
                <h2 className="text-lg font-semibold text-white capitalize">{type}</h2>
              </div>
              <div className="divide-y divide-[#2f2f2f]">
                {items.map((item) => (
                  <PricingRow
                    key={item.key}
                    item={item}
                    onSave={handleSave}
                    saving={saving === item.key}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {pricing.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleBulkSave}
            disabled={saving}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save All Changes
            {saving === "bulk" && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>
        </div>
      )}
    </div>
  );
}

function PricingRow({ item, onSave, saving }) {
  const [price, setPrice] = useState(item.price);

  const handleBlur = () => {
    const newPrice = Number(price) || 0;
    if (newPrice !== item.price) {
      onSave(item.key, newPrice);
      setPrice(newPrice);
    }
  };

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{item.label}</p>
        <p className="text-xs text-zinc-500 mt-1">
          {item.printSize} • {item.sides} side{item.sides === "double" ? "s" : ""}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-zinc-400 text-sm w-8 text-right">₹</span>
        <input
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          disabled={saving}
          className="w-24 px-3 py-2 bg-[#121212] border border-[#3f3f46] rounded-lg text-white text-right focus:border-cyan-500 focus:outline-none disabled:opacity-50"
        />
        {saving && <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />}
      </div>
    </div>
  );
}