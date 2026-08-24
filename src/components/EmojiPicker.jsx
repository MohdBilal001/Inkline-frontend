import { useEffect, useRef } from 'react'

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','🙂','🙃','😉','😌','😍','🥰','😘',
  '😎','🤩','🥳','😇','🤔','🫡','🤗','😐','😑','😶','🙄','😏','😴','🤯','😱','😢',
  '😭','😤','😡','🤬','🤝','👏','🙌','👍','👎','❤️','🧡','💛','💚','💙','💜','🖤',
  '✨','🔥','🌟','💫','🎉','🎊','💡','🚀','💪','🙏','💯','✅','❌','⭐','🌈','☀️'
]

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) onClose?.()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute z-50 bottom-full right-0 mb-2 w-72 rounded-xl border border-line bg-paper shadow-xl p-3"
    >
      <div className="grid grid-cols-8 gap-1 max-h-56 overflow-y-auto">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="h-8 w-8 rounded-md text-xl hover:bg-paper-dim transition-colors"
            aria-label={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
