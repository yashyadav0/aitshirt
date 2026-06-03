import SkeletonCard from "../components/SkeletonCard";

import {
  useEffect,
  useState
} from "react";

import api from "../api";

import {
  showSuccess,
  showError,
} from "../utils/toast";


export default function AdminProducts() {

  const [products,
    setProducts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


  // =====================================
  // FETCH PRODUCTS
  // =====================================

  async function fetchProducts() {

    try {

      const { data } =
        await api.get(
          "/admin/products"
        );


      setProducts(
        data || []
      );

    } catch (err) {

      console.log(err);

      showError(
        "Failed to fetch products"
      );

    } finally {

      setLoading(false);
    }
  }


  // =====================================
  // TOGGLE FEATURED
  // =====================================

  async function toggleFeatured(
    id
  ) {

    try {

      const updatedProducts =
        products.map(
          (product) =>

            product._id === id

              ? {

                  ...product,

                  featured:
                    !product.featured
                }

              : product
        );


      setProducts(
        updatedProducts
      );


      showSuccess(
        "Product updated"
      );

    } catch (err) {

      console.log(err);

      showError(
        "Failed to update product"
      );
    }
  }


  // =====================================
  // DELETE PRODUCT
  // =====================================

  async function deleteProduct(
    id
  ) {

    try {

      await api.delete(
        `/admin/products/${id}`
      );


      setProducts(
        (prev) =>

          prev.filter(
            (product) =>

              product._id !== id
          )
      );


      showSuccess(
        "Product deleted"
      );

    } catch (err) {

      console.log(err);

      showError(
        "Failed to delete product"
      );
    }
  }


  useEffect(() => {

    fetchProducts();

  }, []);


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-black
          text-white
          flex
          items-center
          justify-center
          text-2xl
        "
      >

        Loading Products...

      </div>
    );
  }


  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
        p-6
      "
    >

      {/* HEADER */}

      <div
        className="
          mb-8
        "
      >

        <h1
          className="
            text-4xl
            font-bold
          "
        >

          Admin Products

        </h1>


        <p
          className="
            text-zinc-400
            mt-2
          "
        >

          Manage AI generated products

        </p>

      </div>


      {/* PRODUCTS GRID */}

      <div
        className="
          grid
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-6
        "
      >

        {
          products.length > 0

            ? (

              products.map(
                (product) => (

                  <div

                    key={product._id}

                    className="
                      bg-zinc-900
                      border
                      border-zinc-800
                      rounded-2xl
                      overflow-hidden
                      shadow-lg
                      hover:scale-[1.02]
                      transition-all
                      duration-300
                    "
                  >

                    {/* IMAGE */}

                    <div
                      className="
                        relative
                        h-64
                        overflow-hidden
                      "
                    >

                      <img

                        src={
                          product.imageUrl
                          || product.image
                        }

                        alt={
                          product.prompt
                          || product.name
                        }

                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />


                      {/* FEATURED */}

                      {
                        product.featured
                        && (

                          <span
                            className="
                              absolute
                              top-3
                              left-3
                              bg-yellow-500
                              text-black
                              px-3
                              py-1
                              rounded-full
                              text-sm
                              font-semibold
                            "
                          >

                            Featured

                          </span>
                        )
                      }

                    </div>


                    {/* CONTENT */}

                    <div
                      className="
                        p-5
                      "
                    >

                      {/* PROMPT */}

                      <p
                        className="
                          text-zinc-300
                          text-sm
                          line-clamp-3
                          mb-4
                        "
                      >

                        {
                          product.prompt
                          || product.name
                        }

                      </p>


                      {/* PRICE */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          mb-5
                        "
                      >

                        <span
                          className="
                            text-2xl
                            font-bold
                            text-green-400
                          "
                        >

                          ₹
                          {
                            product.price
                            || 999
                          }

                        </span>


                        <span
                          className="
                            px-3
                            py-1
                            rounded-full
                            text-sm
                            bg-green-500/20
                            text-green-400
                          "
                        >

                          Inventory

                        </span>

                      </div>


                      {/* INVENTORY */}

                      <div
                        className="
                          mt-4
                          mb-5
                          flex
                          flex-col
                          gap-2
                        "
                      >

                        <p
                          className="
                            text-sm
                            text-zinc-400
                            font-semibold
                          "
                        >

                          Variants

                        </p>


                        <div
                          className="
                            grid
                            grid-cols-3
                            gap-2
                          "
                        >

                          {
                            product.variants?.map(
                              (
                                variant,
                                index
                              ) => (

                                <div

                                  key={index}

                                  className={`
                                    rounded-xl
                                    p-2
                                    text-xs
                                    border

                                    ${
                                      variant.stock <= 3

                                        ? `
                                          border-red-500
                                          text-red-400
                                        `

                                        : `
                                          border-zinc-700
                                          text-zinc-300
                                        `
                                    }
                                  `}
                                >

                                  <div>
                                    {
                                      variant.color
                                    }
                                  </div>

                                  <div>
                                    {
                                      variant.size
                                    }
                                  </div>

                                  <div
                                    className="
                                      font-bold
                                    "
                                  >

                                    Stock:
                                    {" "}
                                    {
                                      variant.stock
                                    }

                                  </div>

                                </div>
                              )
                            )
                          }

                        </div>

                      </div>


                      {/* BUTTONS */}

                      <div
                        className="
                          flex
                          gap-3
                        "
                      >

                        {/* FEATURE */}

                        <button

                          onClick={() =>
                            toggleFeatured(
                              product._id
                            )
                          }

                          className={`
                            flex-1
                            py-2
                            rounded-xl
                            font-medium
                            transition-all

                            ${
                              product.featured

                                ? `
                                  bg-yellow-500
                                  text-black
                                `

                                : `
                                  bg-zinc-800
                                  hover:bg-zinc-700
                                `
                            }
                          `}
                        >

                          {
                            product.featured
                              ? "Featured"
                              : "Feature"
                          }

                        </button>


                        {/* DELETE */}

                        <button

                          onClick={() =>
                            deleteProduct(
                              product._id
                            )
                          }

                          className="
                            flex-1
                            bg-red-500
                            hover:bg-red-600
                            py-2
                            rounded-xl
                            font-medium
                            transition-all
                          "
                        >

                          Delete

                        </button>

                      </div>

                    </div>

                  </div>
                )
              )
            )

            : (

              <div
                className="
                  col-span-full
                  text-center
                  py-20
                  text-zinc-500
                "
              >

                No products found

              </div>
            )
        }

      </div>

    </div>
  );
}