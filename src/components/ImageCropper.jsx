import { useEffect, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default function ImageCropper({ file, onCancel, onCrop }) {
  const [src, setSrc] = useState('')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const imageRef = useRef(null)

  const frameWidth = 960
  const frameHeight = 540

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSrc(url)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setNatural({ width: 0, height: 0 })
    return () => URL.revokeObjectURL(url)
  }, [file])

  const baseScale = natural.width && natural.height
    ? Math.max(frameWidth / natural.width, frameHeight / natural.height)
    : 1
  const renderedWidth = natural.width * baseScale * zoom
  const renderedHeight = natural.height * baseScale * zoom

  function beginDrag(event) {
    event.preventDefault()
    setDragging(true)
    dragStart.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y
    }
  }

  function moveDrag(event) {
    if (!dragging || !dragStart.current) return
    setOffset({
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y
    })
  }

  function endDrag() {
    setDragging(false)
    dragStart.current = null
  }

  function handleCrop() {
    const image = imageRef.current
    if (!image || !natural.width) return

    const scale = baseScale * zoom
    const cropX = (renderedWidth - frameWidth) / 2 - offset.x
    const cropY = (renderedHeight - frameHeight) / 2 - offset.y

    const sx = clamp(cropX / scale, 0, Math.max(0, natural.width - frameWidth / scale))
    const sy = clamp(cropY / scale, 0, Math.max(0, natural.height - frameHeight / scale))
    const sw = Math.min(natural.width - sx, frameWidth / scale)
    const sh = Math.min(natural.height - sy, frameHeight / scale)

    const canvas = document.createElement('canvas')
    canvas.width = frameWidth
    canvas.height = frameHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, frameWidth, frameHeight)

    canvas.toBlob((blob) => {
      if (!blob) return
      onCrop(new File([blob], 'inkline-cover.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.9)
  }

  if (!src) return null

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-line bg-paper p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-medium">Crop cover image</h2>
            <p className="font-sans text-sm text-muted mt-1">Drag the image and adjust zoom. The cover uses a 16:9 crop.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full border border-line px-4 py-2 text-sm font-sans">
            Cancel
          </button>
        </div>

        <div
          className="relative mx-auto w-full max-w-2xl aspect-video overflow-hidden rounded-lg bg-ink cursor-grab active:cursor-grabbing select-none"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          <img
            ref={imageRef}
            src={src}
            alt="Crop preview"
            draggable="false"
            onLoad={(event) => setNatural({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight
            })}
            className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
            style={{
              width: natural.width ? `${renderedWidth}px` : '100%',
              height: natural.height ? `${renderedHeight}px` : '100%',
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`
            }}
          />
          <div className="absolute inset-0 ring-2 ring-white/80 pointer-events-none" />
        </div>

        <div className="flex items-center gap-4 mt-5">
          <span className="font-sans text-sm text-muted">Zoom</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-accent"
          />
          <button
            type="button"
            onClick={handleCrop}
            disabled={!natural.width}
            className="rounded-full bg-ink text-paper px-6 py-3 font-sans font-medium hover:bg-accent disabled:opacity-50"
          >
            Use this image
          </button>
        </div>
      </div>
    </div>
  )
}
