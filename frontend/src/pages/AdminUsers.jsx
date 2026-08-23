import {
  useEffect,
  useState
} from "react";

import API from "../api";

import {
  Users,
  Shield,
  ShieldOff
} from "lucide-react";

import {
  showSuccess,
  showError
} from "../utils/toast";

const TIER_OPTIONS = [
  "normal",
  "recurring",
  "vip"
];

// Mock fallback data for graceful rendering when API fails
const MOCK_USERS = [
  {
    _id: "mock-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    isBlocked: false,
    tier: "premium",
    weeklyLimit: 999,
    weeklyPromptsLeft: 999,
    extraPrompts: 0,
    promptCreditBalance: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: "mock-2",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    isBlocked: false,
    tier: "normal",
    weeklyLimit: 7,
    weeklyPromptsLeft: 3,
    extraPrompts: 2,
    promptCreditBalance: 5,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    _id: "mock-3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    isBlocked: true,
    tier: "recurring",
    weeklyLimit: 20,
    weeklyPromptsLeft: 12,
    extraPrompts: 10,
    promptCreditBalance: 0,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  }
];

export default function AdminUsers() {

  const [users,
    setUsers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [editingId,
    setEditingId] =
    useState(null);

  const [editForm,
    setEditForm] =
    useState({});

  const [usingMockData,
    setUsingMockData] =
    useState(false);


  // 👥 Fetch Users
  async function fetchUsers() {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      // Dev/test bypass header for local testing without DB admin role
      const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";
      const headers = {
        Authorization: `Bearer ${token}`
      };
      if (isDev) {
        headers["x-admin-bypass"] = "true";
      }


      const res =
        await API.get(

          "/admin/users",

          { headers }
        );


      setUsers(
        res.data
      );
      setUsingMockData(false);

    } catch (err) {

      const status = err?.response?.status;
      const message = err?.response?.data?.error || err.message;

      console.log(
        "FETCH USERS ERROR:",
        { status, message, stack: err.stack }
      );

      if (status === 403) {
        console.warn("Admin access denied (403) - falling back to demo data. To test with real data, ensure your user has role='admin' in MongoDB, or set x-admin-bypass header.");
        showError("Admin access required. Showing demo data.");
      } else if (status === 401) {
        console.warn("Session expired (401) - falling back to demo data.");
        showError("Session expired. Showing demo data.");
      } else {
        console.warn("Failed to fetch users - falling back to demo data.", { status, message });
        showError("Failed to fetch users. Showing demo data.");
      }

      // Fallback to mock data for graceful rendering
      setUsers(MOCK_USERS);
      setUsingMockData(true);

    } finally {

      setLoading(false);
    }
  }


  // 🚫 Block / Unblock
  async function toggleBlockUser(id) {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      await API.put(

        `/admin/block-user/${id}`,

        {},

        {

          headers: {

            Authorization:
              `Bearer ${token}`
          }
        }
      );


      showSuccess(
        "User updated"
      );

      fetchUsers();

    } catch (err) {

      console.log(
        "BLOCK USER ERROR:",
        err
      );

      showError(
        "Failed to update user"
      );
    }
  }


  // ✏️ Begin editing tier/credits
  function startEdit(user) {

    setEditingId(user._id);
    setEditForm({
      tier: user.tier || "free",
      weeklyLimit: user.weeklyLimit ?? 5,
      extraPrompts: user.extraPrompts ?? 0,
      promptCreditBalance: user.promptCreditBalance ?? 0,
      weeklyPromptsLeft: user.weeklyPromptsLeft ?? 0
    });
  }


  // 💾 Save tier/credits
  async function saveEdit(id) {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await API.put(

        `/admin/users/${id}`,

        editForm,

        {

          headers: {

            Authorization:
              `Bearer ${token}`
          }
        }
      );


      showSuccess(
        "User plan updated"
      );

      setEditingId(null);
      fetchUsers();

    } catch (err) {

      console.log(
        "UPDATE USER ERROR:",
        err
      );

      showError(
        "Failed to update user"
      );
    }
  }


  useEffect(() => {

    fetchUsers();

  }, []);


  // ⏳ Loading
  if (loading) {

    return (

      <div
        className="
          flex-1
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          text-2xl
          md:text-3xl
          font-bold
        "
      >

        Loading Users...

      </div>
    );
  }


  return (

    <div
      className="
        flex-1
        min-h-screen
        bg-black
        text-white
        p-4
        pt-24
        md:p-8
        md:pt-8
      "
    >

      {/* Header */}
      <div
        className="
          flex
          items-center
          gap-4
          mb-8
        "
      >

        <Users size={36} />

        <h1
          className="
            text-4xl
            md:text-5xl
            font-bold
          "
        >

          Manage Users

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
            <span>Showing sample data. Log in as an admin user to manage real users.</span>
          </div>
        )
      }


      {/* Empty */}
      {
        users.length === 0 && (

          <div
            className="
              text-zinc-500
              text-xl
            "
          >

            No users found

          </div>
        )
      }


      {/* Users List */}
      <div
        className="
          flex
          flex-col
          gap-5
        "
      >

        {
          users.map(
            (user) => {

              const isEditing =
                editingId === user._id;

              return (

                <div

                  key={user._id}

                  className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-3xl
                    p-5
                    md:p-6
                    hover:border-zinc-700
                    transition-all
                  "
                >

                  {/* Top */}
                  <div
                    className="
                      flex
                      flex-col
                      md:flex-row
                      md:items-center
                      md:justify-between
                      gap-5
                    "
                  >

                    {/* User Info */}
                    <div
                      className="
                        flex
                        flex-col
                        gap-2
                      "
                    >

                      {/* Name */}
                      <h2
                        className="
                          text-2xl
                          font-bold
                          break-words
                        "
                      >

                        {
                          user.name ||
                          "Unnamed User"
                        }

                      </h2>


                      {/* Email */}
                      <p
                        className="
                          text-zinc-400
                          break-all
                          text-sm
                          md:text-base
                        "
                      >

                        {
                          user.email ||
                          user.phone ||
                          "No contact info"
                        }

                      </p>


                      {/* Role */}
                      <div
                        className="
                          flex
                          flex-wrap
                          gap-3
                          mt-2
                        "
                      >

                        <div
                          className="
                            bg-zinc-800
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            capitalize
                          "
                        >

                          Role:
                          {" "}
                          {user.role}

                        </div>


                        {/* Status */}
                        <div
                          className={`
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            font-medium

                            ${
                              user.isBlocked

                                ? "bg-red-500/20 text-red-400"

                                : "bg-green-500/20 text-green-400"
                            }
                          `}
                        >

                          {
                            user.isBlocked
                              ? "Blocked"
                              : "Active"
                          }

                        </div>

                        {/* Tier */}
                        <div
                          className="
                            bg-cyan-500/15
                            text-cyan-300
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            capitalize
                          "
                        >

                          Tier:
                          {" "}
                          {user.tier || "free"}

                        </div>

                      </div>

                    </div>


                    {/* Action */}
                    <div
                      className="
                        flex
                        flex-col
                        gap-3
                        min-w-[180px]
                      "
                    >

                      <button

                        onClick={() =>
                          toggleBlockUser(
                            user._id
                          )
                        }

                        className={`
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-6
                          py-4
                          rounded-2xl
                          font-semibold
                          transition-all

                          ${
                            user.isBlocked

                              ? "bg-green-500 hover:bg-green-400"

                              : "bg-red-500 hover:bg-red-400"
                          }
                        `}
                      >

                        {
                          user.isBlocked

                            ? (
                              <Shield
                                size={20}
                              />
                            )

                            : (
                              <ShieldOff
                                size={20}
                              />
                            )
                        }

                        {
                          user.isBlocked

                            ? "Unblock User"

                            : "Block User"
                        }

                      </button>

                      <button

                        onClick={() =>
                          isEditing
                            ? setEditingId(null)
                            : startEdit(user)
                        }

                        className="
                          px-6
                          py-3
                          rounded-2xl
                          font-semibold
                          bg-zinc-800
                          hover:bg-zinc-700
                          transition-all
                          text-sm
                        "
                      >

                        {
                          isEditing
                            ? "Cancel"
                            : "Edit Plan"
                        }

                      </button>

                    </div>

                  </div>


                  {/* Tier / Credits Editor */}
                  {
                    isEditing && (

                      <div
                        className="
                          mt-6
                          pt-6
                          border-t
                          border-zinc-800
                          grid
                          grid-cols-1
                          md:grid-cols-2
                          gap-4
                        "
                      >

                        {/* Usage display */}
                        <div
                          className="
                            md:col-span-2
                            text-sm
                            text-zinc-400
                          "
                        >
                          Current usage:
                          {" "}
                          <span
                            className="
                              text-zinc-200
                            "
                          >
                            {user.weeklyPromptsLeft ?? 0}
                            {" / "}
                            {user.weeklyLimit ?? 5}
                            {" weekly"}
                          </span>
                          {" · "}
                          <span
                            className="
                              text-zinc-200
                            "
                          >
                            {user.extraPrompts ?? 0}
                            {" extra"}
                          </span>
                          {" · "}
                          <span
                            className="
                              text-zinc-200
                            "
                          >
                            {user.promptCreditBalance ?? 0}
                            {" credits"}
                          </span>
                        </div>

                        {/* Tier */}
                        <label
                          className="
                            flex
                            flex-col
                            gap-2
                            text-sm
                            text-zinc-400
                          "
                        >
                          Tier
                          <select
                            value={editForm.tier}
                            onChange={(e) =>
                              setEditForm(
                                (prev) => ({
                                  ...prev,
                                  tier: e.target.value
                                })
                              )
                            }
                            className="
                              bg-zinc-800
                              border
                              border-zinc-700
                              rounded-xl
                              px-3
                              py-2
                              text-white
                              outline-none
                            "
                          >
                            {
                              TIER_OPTIONS.map(
                                (t) => (
                                  <option
                                    key={t}
                                    value={t}
                                  >
                                    {t}
                                  </option>
                                )
                              )
                            }
                          </select>
                        </label>

                        {/* Weekly Limit */}
                        <label
                          className="
                            flex
                            flex-col
                            gap-2
                            text-sm
                            text-zinc-400
                          "
                        >
                          Weekly Limit
                          <input
                            type="number"
                            min="0"
                            value={editForm.weeklyLimit}
                            onChange={(e) =>
                              setEditForm(
                                (prev) => ({
                                  ...prev,
                                  weeklyLimit:
                                    Number(e.target.value) || 0
                                })
                              )
                            }
                            className="
                              bg-zinc-800
                              border
                              border-zinc-700
                              rounded-xl
                              px-3
                              py-2
                              text-white
                              outline-none
                            "
                          />
                        </label>

                        {/* Extra Prompts */}
                        <label
                          className="
                            flex
                            flex-col
                            gap-2
                            text-sm
                            text-zinc-400
                          "
                        >
                          Extra Prompts
                          <input
                            type="number"
                            min="0"
                            value={editForm.extraPrompts}
                            onChange={(e) =>
                              setEditForm(
                                (prev) => ({
                                  ...prev,
                                  extraPrompts:
                                    Number(e.target.value) || 0
                                })
                              )
                            }
                            className="
                              bg-zinc-800
                              border
                              border-zinc-700
                              rounded-xl
                              px-3
                              py-2
                              text-white
                              outline-none
                            "
                          />
                        </label>

                        {/* Credit Balance */}
                        <label
                          className="
                            flex
                            flex-col
                            gap-2
                            text-sm
                            text-zinc-400
                          "
                        >
                          Credit Balance
                          <input
                            type="number"
                            min="0"
                            value={editForm.promptCreditBalance}
                            onChange={(e) =>
                              setEditForm(
                                (prev) => ({
                                  ...prev,
                                  promptCreditBalance:
                                    Number(e.target.value) || 0
                                })
                              )
                            }
                            className="
                              bg-zinc-800
                              border
                              border-zinc-700
                              rounded-xl
                              px-3
                              py-2
                              text-white
                              outline-none
                            "
                          />
                        </label>

                        {/* Save */}
                        <div
                          className="
                            md:col-span-2
                            flex
                            justify-end
                          "
                        >
                          <button
                            onClick={() =>
                              saveEdit(user._id)
                            }
                            className="
                              px-6
                              py-3
                              rounded-2xl
                              font-semibold
                              bg-cyan-500
                              text-black
                              hover:bg-cyan-400
                              transition-all
                            "
                          >
                            Save Plan
                          </button>
                        </div>

                      </div>
                    )
                  }

                </div>
              );
            }
          )
        }

      </div>

    </div>
  );
}
