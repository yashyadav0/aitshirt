import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {

  Menu,
  X,

  Sparkles,
  ShoppingCart,
  Heart,
  Package,
  History,
  LayoutDashboard,
  Users,
  Shirt,
  TicketPercent,
  LogOut

} from "lucide-react";


export default function Sidebar() {

  const navigate =
    useNavigate();

  const [open,
    setOpen] =
    useState(false);


  const role =
    localStorage.getItem(
      "role"
    );


  // 🚪 Logout
  function logout() {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/login");
  }


  return (

    <>

      {/* 🍔 Mobile Button */}
      <button

        onClick={() =>
          setOpen(!open)
        }

        className="
          fixed
          top-4
          left-4
          z-50
          bg-[#111111]
          border
          border-zinc-800
          p-3
          rounded-2xl
          shadow-xl
          md:hidden
        "
      >

        {
          open
            ? <X size={28} />
            : <Menu size={28} />
        }

      </button>


      {/* 🌑 Overlay */}
      {
        open && (

          <div

            onClick={() =>
              setOpen(false)
            }

            className="
              fixed
              inset-0
              bg-black/60
              backdrop-blur-sm
              z-40
              md:hidden
            "
          />
        )
      }


      {/* 📚 Sidebar */}
      <aside

        className={`
          fixed
          top-0
          left-0
          h-screen
          overflow-y-auto
          overscroll-contain
          w-[280px]
          bg-[#0f0f0f]
          border-r
          border-zinc-900
          z-50
          transition-all
          duration-300
          flex
          flex-col

          ${open
            ? "translate-x-0"
            : "-translate-x-full"
          }

          md:translate-x-0
          md:static
        `}
      >

        {/* Logo */}
        <div
          className="
            px-6
            pt-8
            pb-6
            border-b
            border-zinc-900
          "
        >

          <h1
            className="
              text-4xl
              font-black
              bg-gradient-to-r
              from-purple-500
              to-cyan-400
              bg-clip-text
              text-transparent
            "
          >

            AIWear

          </h1>

        </div>


        {/* Links */}
        <div
          className="
            flex-1
            px-4
            py-6
            flex
            flex-col
            gap-2
          "
        >

          {/* Workspace */}
          <Link

            to="/workspace"

            onClick={() =>
              setOpen(false)
            }

            className="
              flex
              items-center
              gap-4
              px-4
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-purple-600
              to-cyan-500
              font-semibold
              text-lg
              hover:opacity-90
              transition-all
            "
          >

            <Sparkles size={22} />

            AI Workspace

          </Link>


          {/* History */}
          <Link

            to="/history"

            onClick={() =>
              setOpen(false)
            }

            className="
              flex
              items-center
              gap-4
              px-4
              py-4
              rounded-2xl
              hover:bg-zinc-900
              transition-all
              text-lg
            "
          >

            <History size={22} />

            History

          </Link>


          {/* Cart */}
          <Link

            to="/cart"

            onClick={() =>
              setOpen(false)
            }

            className="
              flex
              items-center
              gap-4
              px-4
              py-4
              rounded-2xl
              hover:bg-zinc-900
              transition-all
              text-lg
            "
          >

            <ShoppingCart size={22} />

            Cart

          </Link>


          {/* Wishlist */}
          <Link

            to="/wishlist"

            onClick={() =>
              setOpen(false)
            }

            className="
              flex
              items-center
              gap-4
              px-4
              py-4
              rounded-2xl
              hover:bg-zinc-900
              transition-all
              text-lg
            "
          >

            <Heart size={22} />

            Wishlist

          </Link>


          {/* Orders */}
          <Link

            to="/orders"

            onClick={() =>
              setOpen(false)
            }

            className="
              flex
              items-center
              gap-4
              px-4
              py-4
              rounded-2xl
              hover:bg-zinc-900
              transition-all
              text-lg
            "
          >

            <Package size={22} />

            Orders

          </Link>


          {/* 👑 Admin */}
          {
            role === "admin" && (

              <>

                <div
                  className="
                    mt-6
                    mb-2
                    px-4
                    text-zinc-500
                    text-sm
                    uppercase
                    tracking-widest
                  "
                >

                  Admin

                </div>


                <Link

                  to="/admin"

                  onClick={() =>
                    setOpen(false)
                  }

                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    rounded-2xl
                    hover:bg-zinc-900
                    transition-all
                    text-lg
                  "
                >

                  <LayoutDashboard
                    size={22}
                  />

                  Dashboard

                </Link>


                <Link

                  to="/admin-users"

                  onClick={() =>
                    setOpen(false)
                  }

                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    rounded-2xl
                    hover:bg-zinc-900
                    transition-all
                    text-lg
                  "
                >

                  <Users size={22} />

                  Users

                </Link>


                <Link

                  to="/admin-orders"

                  onClick={() =>
                    setOpen(false)
                  }

                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    rounded-2xl
                    hover:bg-zinc-900
                    transition-all
                    text-lg
                  "
                >

                  <Package size={22} />

                  Orders

                </Link>


                <Link

                  to="/admin-products"

                  onClick={() =>
                    setOpen(false)
                  }

                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    rounded-2xl
                    hover:bg-zinc-900
                    transition-all
                    text-lg
                  "
                >

                  <Shirt size={22} />

                  Products

                </Link>


                <Link

                  to="/admin-coupons"

                  onClick={() =>
                    setOpen(false)
                  }

                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    rounded-2xl
                    hover:bg-zinc-900
                    transition-all
                    text-lg
                  "
                >

                  <TicketPercent
                    size={22}
                  />

                  Coupons

                </Link>

              </>
            )
          }

        </div>


        {/* 🚪 Logout */}
        <div
          className="
            p-4
            border-t
            border-zinc-900
          "
        >

          <button

            onClick={logout}

            className="
              w-full
              flex
              items-center
              justify-center
              gap-3
              bg-red-500
              hover:bg-red-400
              transition-all
              rounded-2xl
              py-4
              font-semibold
              text-lg
            "
          >

            <LogOut size={22} />

            Logout

          </button>

        </div>

      </aside>

    </>
  );
}