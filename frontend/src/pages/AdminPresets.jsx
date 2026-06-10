import {
  useEffect,
  useState
} from "react";

import {
  Plus,
  Trash2
} from "lucide-react";

import API from "../api";

export default function AdminPresets() {

  const [presets,
    setPresets] =
    useState([]);

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

      const res =
        await API.get(
          "/presets/admin",
          {
            headers
          }
        );

      setPresets(
        res.data
      );
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

      await API.post(
        "/presets",
        form,
        {
          headers
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

      await API.put(
        `/presets/${preset._id}`,
        {
          ...preset,
          ...changes
        },
        {
          headers
        }
      );

      loadPresets();
    };

  const deletePreset =
    async (id) => {

      await API.delete(
        `/presets/${id}`,
        {
          headers
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

          <div
            className="
              grid
              gap-3
              md:grid-cols-[1fr_120px]
            "
          >

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Preset name"
              className="rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
            />

            <input
              value={form.emoji}
              onChange={(e) =>
                setForm({
                  ...form,
                  emoji: e.target.value
                })
              }
              placeholder="Emoji"
              className="rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none"
            />

          </div>

          <textarea
            value={form.prompt}
            onChange={(e) =>
              setForm({
                ...form,
                prompt: e.target.value
              })
            }
            placeholder="Preset prompt"
            className="mt-3 w-full min-h-28 rounded-2xl bg-[#0f0f0f] border border-[#333] px-4 py-3 outline-none resize-none"
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

                  <div>
                    <h2 className="font-medium">
                      {preset.emoji} {preset.name}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                      {preset.prompt}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      deletePreset(
                        preset._id
                      )
                    }
                    className="rounded-xl border border-[#333] p-3 text-zinc-400 hover:text-white"
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
