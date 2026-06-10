import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useLocation,
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
  Settings,
  LayoutDashboard,
  Users,
  Shirt,
  TicketPercent,
  SlidersHorizontal,
  LogOut
} from "lucide-react";

import {
  useAuth
} from "../auth/AuthContext";

export default function Sidebar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [open,
    setOpen] =
    useState(false);

  const {
    logout: firebaseLogout,
    profile
  } =
    useAuth();

  const role =
    profile?.role ||
    localStorage.getItem(
      "role"
    );

  useEffect(() => {

    const onKeyDown =
      (event) => {

        if (
          event.key === "Escape"
        ) {
          setOpen(false);
        }
      };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

  }, []);

  async function logout() {

    await firebaseLogout();

    navigate("/login");
  }

  const links = [
    {
      to: "/workspace",
      label: "AI Workspace",
      icon: Sparkles
    },
    {
      to: "/history",
      label: "History",
      icon: History
    },
    {
      to: "/cart",
      label: "Cart",
      icon: ShoppingCart
    },
    {
      to: "/wishlist",
      label: "Wishlist",
      icon: Heart
    },
    {
      to: "/orders",
      label: "Orders",
      icon: Package
    },
    {
      to: "/settings",
      label: "Settings",
      icon: Settings
    }
  ];

  const adminLinks = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      to: "/admin-users",
      label: "Users",
      icon: Users
    },
    {
      to: "/admin-orders",
      label: "Orders",
      icon: Package
    },
    {
      to: "/admin-products",
      label: "Products",
      icon: Shirt
    },
    {
      to: "/admin-coupons",
      label: "Coupons",
      icon: TicketPercent
    },
    {
      to: "/admin-presets",
      label: "Presets",
      icon: SlidersHorizontal
    }
  ];

  const navLink =
    (item) => {

      const Icon =
        item.icon;

      const active =
        location.pathname === item.to;

      return (

        <Link
          key={item.to}
          to={item.to}
          onClick={() =>
            setOpen(false)
          }
          className={`
            flex
            min-h-12
            items-center
            gap-3
            rounded-2xl
            px-3
            py-3
            text-sm
            transition-all
            ${
              active
                ? "bg-[#2f2f2f] text-white"
                : "text-zinc-400 hover:bg-[#202020] hover:text-white"
            }
          `}
        >
          <Icon size={18} />
          {item.label}
        </Link>
      );
    };

  const sidebarContent = (

    <>
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <Link
            to="/workspace"
            onClick={() =>
              setOpen(false)
            }
            className="text-xl font-semibold tracking-tight"
          >
            AIWear
          </Link>

          <button
            onClick={() =>
              setOpen(false)
            }
            className="rounded-xl p-2 text-zinc-400 hover:bg-[#202020] md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(navLink)}

        {
          role === "admin" && (
            <div className="pt-5">
              <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
                Admin
              </p>
              {adminLinks.map(navLink)}
            </div>
          )
        }
      </nav>

      <div className="p-3">
        <div className="mb-3 rounded-3xl border border-[#2f2f2f] bg-[#171717] p-3">
          <p className="text-sm font-medium">
            Creative Studio
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            AI apparel generation
          </p>
        </div>

        <button
          onClick={logout}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm text-zinc-400 transition hover:bg-[#202020] hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (

    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-[#2f2f2f] bg-[#0b0b0b]/95 px-4 backdrop-blur md:hidden">
        <button
          onClick={() =>
            setOpen(true)
          }
          className="rounded-xl p-2 text-zinc-300 hover:bg-[#202020]"
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <Link
          to="/workspace"
          className="font-semibold"
        >
          AIWear
        </Link>
      </header>

      {
        open && (
          <div
            onClick={() =>
              setOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )
      }

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          flex-col
          border-r
          border-[#2f2f2f]
          bg-[#0f0f0f]
          transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
          md:translate-x-0
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
