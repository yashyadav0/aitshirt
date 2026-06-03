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
          bg-[#18181b]
          rounded-[24px]
          p-6
          mb-5
          border
          border-[#27272a]
          cursor-pointer
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

            : "Choose Files"
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
                      rounded-2xl
                      border
                      border-[#27272a]
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