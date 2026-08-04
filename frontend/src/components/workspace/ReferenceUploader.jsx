export default function ReferenceUploader({

  referenceImages,
  setReferenceImages

}) {

  return (

    <>
      <label
        className="
          w-full
          block
          bg-[#101010]
          rounded-2xl
          px-4
          py-3
          mb-3
          border
          border-[#2f2f2f]
          cursor-pointer
          text-sm
          text-zinc-400
          transition
          hover:text-white
          hover:border-[#3f3f46]
        "
      >

        <input

          type="file"

          multiple

          hidden

          onChange={(e) =>

            setReferenceImages(

              Array.from(
                e.target.files
              )
            )
          }
        />

        {

          referenceImages.length > 0

            ? `${referenceImages.length} files selected`

            : "Upload Image"
        }

      </label>


      {
        referenceImages.length > 0 && (

          <div
            className="
              flex
              gap-3
              overflow-x-auto
              mb-5
            "
          >

            {
              referenceImages.map(
                (file, index) => (

                  <img

                    key={index}

                    src={
                      URL.createObjectURL(
                        file
                      )
                    }

                    alt="preview"

                    className="
                      w-24
                      h-24
                      object-cover
                      rounded-xl
                      border
                      border-[#2f2f2f]
                      flex-shrink-0
                    "
                  />
                )
              )
            }

          </div>
        )
      }
    </>
  );
}
