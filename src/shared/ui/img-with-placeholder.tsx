import { memo, useState } from 'react'
import { cn } from '@/shared/lib'

function ImgWithPlaceholder(
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
) {
  // The loaded source, not a flag: a new `src` shows the placeholder again without an effect
  // that could run after a fast (cached) image has already loaded and hide it for good
  const [loadedSrc, setLoadedSrc] = useState<string>()
  const isShowImg = loadedSrc !== undefined && loadedSrc === props.src

  return (
    <>
      {!isShowImg && (
        <div className="bg-muted text-muted-foreground w-[400px] text-4xl rounded-4xl h-[400px] mx-auto flex justify-center items-center">
          Image is loading...
        </div>
      )}

      {/* biome-ignore lint/a11y/useAltText: alt is forwarded via {...props} */}
      <img
        {...props}
        onLoad={(e) => {
          if (props.onLoad) {
            props.onLoad(e)
          }

          setLoadedSrc(props.src)
        }}
        className={cn(props.className, !isShowImg && 'hidden')}
      />
    </>
  )
}

const MemoImgWithPlaceholder = memo(ImgWithPlaceholder)

export { MemoImgWithPlaceholder as ImgWithPlaceholder }
