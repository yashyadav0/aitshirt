import {
  useEffect,
  useState
} from "react";

import {
  Plus,
  Trash2
} from "lucide-react";

import API from "../api";

import {
  showError
} from "../utils/toast";

import {
  getAdminHeaders
} from "../utils/adminHeaders";

// Mock presets for graceful fallback
const MOCK_PRESETS = [
  {
    _id: "mock-preset-1",
    name: "Anime Style",
    emoji: "🎨",
    prompt: "A vibrant anime-style illustration with bold colors and clean linework",
    enabled: true
  },
  {
    _id: "mock-preset-2",
    name: "Watercolor",
    emoji: "🖌️",
    prompt: "A soft watercolor painting with flowing gradients and organic textures",
    enabled: true
  },
  {
    _id: "mock-preset-3",
    name: "Retro 80s",
    emoji: "🌟",
    prompt: "An 80s retro synthwave aesthetic with neon grids and sunset gradients",
    enabled: false
  }
];

export default function AdminPresets() {

  const [presets,
    setPresets] =
    useState([]);

  const [usingMockData,
    setUsingMockData] =
    useState(false);

  const [form,
    setForm] =
    useState({
      name: "",
      emoji: "",
      prompt: "",
      enabled: true
    });

  const token =
    localStorage.getItem(
      "token"
    );

  const headers = {
    Authorization:
      `Bearer ${token}`
  };

  const loadPresets =
    async () => {

      try {

        const res =
          await API.get(
            "/presets/admin",
            {
              headers: getAdminHeaders()
            }
          );

        setPresets(
          res.data
        );
        setUsingMockData(false);

      } catch (err) {

        const status = err?.response?.status;
        const message = err?.response?.data?.error || err.message;

        console.log(
          "Presets Error:",
          { status, message, stack: err.stack }
        );

        if (status === 403) {
          console.warn("Admin access denied (403) - falling back to demo data.");
          showError("Admin access required. Showing demo data.");
        } else if (status === 401) {
          console.warn("Session expired (401) - falling back to demo data.");
          showError("Session expired. Showing demo data.");
        } else {
          console.warn("Failed to load presets - falling back to demo data.", { status, message });
          showError("Failed to load presets. Showing demo data.");
        }

        setPresets(MOCK_PRESETS);
        setUsingMockData(true);

      }
    };

  useEffect(() => {

    loadPresets();

  }, []);

  const createPreset =
    async () => {

      if (
        !form.name ||
        !form.prompt
      ) {
        return;
      }

      if (usingMockData) {
        showError("Cannot create presets in demo mode.");
        return;
      }

      await API.post(
        "/presets",
        form,
        {
          headers: getAdminHeaders()
        }
      );

      setForm({
        name: "",
        emoji: "",
        prompt: "",
        enabled: true
      });

      loadPresets();
    };

  const updatePreset =
    async (
      preset,
      changes
    ) => {

      if (usingMockData) {
        showError("Cannot update presets in demo mode.");
        return;
      }

      await API.put(
        `/presets/${preset._id}`,
        {
          ...preset,
          ...changes
        },
        {
          headers: getAdminHeaders()
        }
      );

      loadPresets();
    };

  const deletePreset =
    async (id) => {

      if (usingMockData) {
        showError("Cannot delete presets in demo mode.");
        return;
      }

      await API.delete(
        `/presets/${id}`,
        {
          headers: getAdminHeaders()
        }
      );

      loadPresets();
    };

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

      <div
        className="
          max-w-5xl
          mx-auto
        "
      >

        <div className="mb-8">
          <p className="text-sm text-cyan-300 mb-2">
            AIWear Admin
          </p>

          <h1 className="text-3xl font-semibold">
            Preset Management
          </h1>
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
              <span>Showing sample presets. Log in as an admin user to manage real presets.</span>
            </div>
          )
        }

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

          <label className="block">
            <span className="text-xs text-zinc-400 mb-1 block">Preset Name & Emoji</span>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="e.g., 🎨 Anime Style or Anime Style"
              className="mt-1 w-full rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">Include emoji in the name (e.g., "🎨 Anime Style") or leave blank for default ✨</p>
          </label>

          <textarea
            value={form.prompt}
            onChange={(e) =>
              setForm({
                ...form,
                prompt: e.target.value
              })
            }
            placeholder="Preset prompt"
            className="mt-4 w-full min-h-28 rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none resize-none"
          />

          <button
            onClick={createPreset}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-medium text-black"
          >
            <Plus size={18} />
            Create Preset
          </button>

        </section>

        <div className="grid gap-3">
          {
            presets.map((preset) => (

              <article
                key={preset._id}
                className="
                  rounded-3xl
                  border
                  border-[#2f2f2f]
                  bg-[#121212]
                  p-4
                "
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium flex items-center gap-2">
                      <span className="text-xl">{preset.emoji || "✨"}</span>
                      <span className="truncate">{preset.name}</span>
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400 truncate">
                      {preset.prompt}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      deletePreset(
                        preset._id
                      )
                    }
                    className="rounded-xl border border-[#333] p-3 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                    title="Delete preset"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

                <button
                  onClick={() =>
                    updatePreset(
                      preset,
                      {
                        enabled:
                          !preset.enabled
                      }
                    )
                  }
                  className={`
                    mt-4
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    ${
                      preset.enabled
                        ? "bg-cyan-500 text-black"
                        : "bg-[#242424] text-zinc-300"
                    }
                  `}
                >
                  {preset.enabled ? "Enabled" : "Disabled"}
                </button>

              </article>
            ))
          }
        </div>

      </div>

    </main>
  );
}
