import { memo, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function ImgWithPlaceholder(
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
) {
  const [isShowImg, setIsShowImg] = useState(false)

  useEffect(() => {
    setIsShowImg(false)
  }, [props.src])

  return (
    <>
      {!isShowImg && (
        <div className="bg-orange-500 w-[400px] text-4xl rounded-4xl h-[400px] mx-auto flex justify-center items-center">
          Image is loading...
        </div>
      )}

      <img
        {...props}
        onLoad={(e) => {
          if (props.onLoad) {
            props.onLoad(e)
          }

          setIsShowImg(true)
        }}
        className={cn(props.className, !isShowImg && "hidden")}
      />
    </>
  )
}

export default memo(ImgWithPlaceholder)
