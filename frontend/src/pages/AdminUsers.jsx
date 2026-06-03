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


export default function AdminUsers() {

  const [users,
    setUsers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


  // 👥 Fetch Users
  async function fetchUsers() {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const res =
        await API.get(

          "/admin/users",

          {

            headers: {

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setUsers(
        res.data
      );

    } catch (err) {

      console.log(
        "FETCH USERS ERROR:",
        err
      );

      showError(
        "Failed to fetch users"
      );

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
            (user) => (

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

                    </div>

                  </div>


                  {/* Action */}
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
                      min-w-[180px]

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

                </div>

              </div>
            )
          )
        }

      </div>

    </div>
  );
}