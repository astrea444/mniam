import { ref, onBeforeUnmount } from 'vue'

const ACTIONS_WIDTH = 96

export function useSwipeRow() {
  const swipedItemId = ref(null)
  const dragOffset = ref(0)
  const draggingId = ref(null)
  const nudgingId = ref(null)

  let startX = 0
  let startY = 0
  let isHorizontal = null
  let _hasMoved = false

  function onPointerDown(e, item) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.target.closest('.row-actions')) return

    if (swipedItemId.value && swipedItemId.value !== item.id) {
      closeSwipe()
    }

    startX = e.clientX
    startY = e.clientY
    isHorizontal = null
    _hasMoved = false
    draggingId.value = item.id
    dragOffset.value = swipedItemId.value === item.id ? -ACTIONS_WIDTH : 0

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  function onPointerMove(e) {
    if (!draggingId.value) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (isHorizontal === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontal = Math.abs(dx) > Math.abs(dy)
      }
    }

    if (!isHorizontal) return

    _hasMoved = true
    const initial = swipedItemId.value === draggingId.value ? -ACTIONS_WIDTH : 0
    let offset = initial + dx
    if (offset > 0) offset = 0
    if (offset < -ACTIONS_WIDTH - 15) offset = -ACTIONS_WIDTH - 15
    dragOffset.value = offset
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)

    if (!draggingId.value) return

    if (isHorizontal && _hasMoved) {
      swipedItemId.value = dragOffset.value < -ACTIONS_WIDTH / 2 ? draggingId.value : null
    }
    draggingId.value = null
    isHorizontal = null
    dragOffset.value = 0
  }

  function getRowStyle(item) {
    if (draggingId.value === item.id) {
      return { transform: `translateX(${dragOffset.value}px)`, transition: 'none' }
    }
    if (swipedItemId.value === item.id) {
      return { transform: `translateX(-${ACTIONS_WIDTH}px)` }
    }
    return { transform: 'translateX(0px)' }
  }

  function getActionsMaskStyle(item) {
    if (draggingId.value === item.id) {
      const width = Math.min(ACTIONS_WIDTH, Math.max(0, -dragOffset.value))
      return { width: `${width}px`, transition: 'none' }
    }
    if (swipedItemId.value === item.id) {
      return { width: `${ACTIONS_WIDTH}px` }
    }
    return { width: '0px' }
  }

  function closeSwipe() {
    swipedItemId.value = null
  }

  function getHasMoved() {
    return _hasMoved
  }

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
  })

  return {
    swipedItemId,
    draggingId,
    nudgingId,
    onPointerDown,
    getRowStyle,
    getActionsMaskStyle,
    closeSwipe,
    getHasMoved,
  }
}
