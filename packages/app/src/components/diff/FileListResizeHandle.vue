<script setup lang="ts">
import { computed, ref } from 'vue'
import { FILE_LIST_MAX_RATIO, fileListColumn, fileListWidth } from '../../state/file-list'

const MIN_WIDTH = 200
const KEY_STEP = 16

/**
 * Where a group's file column ends, measured from the groups' left edge. Mirrors DiffGroup's
 * row: `p-3` padding, then the dragged width (capped against the row's content box) or its
 * default `1fr` of `1fr 4fr` (after the padding and the `gap-4`), floored by the aside's `min-w-70`.
 */
const PADDING = 12
const GAP = 16
const columnEnd = computed(() => fileListWidth.value
  ? `calc(${PADDING}px + ${fileListColumn(fileListWidth.value, `(100% - ${2 * PADDING}px)`)})`
  : `calc(${PADDING}px + max(17.5rem, (100% - ${2 * PADDING + GAP}px) / 5))`)

const handle = ref<HTMLElement>()
const dragging = ref(false)

// The handle's centre sits half a gap right of the column, inside the groups' wrapper.
function measure() {
  const groups = handle.value!.parentElement!
  const rect = handle.value!.getBoundingClientRect()
  return {
    width: rect.left + rect.width / 2 - GAP / 2 - PADDING - groups.getBoundingClientRect().left,
    max: (groups.clientWidth - 2 * PADDING) * FILE_LIST_MAX_RATIO,
  }
}

function resizeTo(width: number, max: number) {
  fileListWidth.value = Math.round(Math.min(Math.max(width, MIN_WIDTH), Math.max(max, MIN_WIDTH)))
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0)
    return
  // Keeps the drag from selecting text in the diffs it passes over.
  event.preventDefault()
  const { width, max } = measure()
  const startX = event.clientX
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  dragging.value = true

  const onMove = (move: PointerEvent) => resizeTo(width + move.clientX - startX, max)
  // Fires after pointerup and pointercancel, and on any other capture loss, so a drag
  // can't stay live and keep resizing on plain hover.
  const onEnd = () => {
    dragging.value = false
    target.removeEventListener('pointermove', onMove)
    target.removeEventListener('lostpointercapture', onEnd)
  }
  target.addEventListener('pointermove', onMove)
  target.addEventListener('lostpointercapture', onEnd)
}

function onKeydown(event: KeyboardEvent) {
  const step = event.key === 'ArrowLeft' ? -KEY_STEP : event.key === 'ArrowRight' ? KEY_STEP : 0
  if (!step)
    return
  event.preventDefault()
  const { width, max } = measure()
  resizeTo(width + step, max)
}
</script>

<template>
  <!-- One handle for every group: it spans the groups' wrapper (DiffsPage) top to bottom and sits
       centered in the 16px gap after the file column; double-click restores the default width. -->
  <div
    ref="handle"
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
    :aria-label="$t('group.resizeFiles')"
    :title="$t('group.resizeFiles')"
    :aria-valuenow="fileListWidth || undefined"
    :aria-valuemin="MIN_WIDTH"
    class="group absolute bottom-3 top-3 ml-1 hidden w-2 cursor-col-resize touch-none outline-none lg:block"
    :style="{ left: columnEnd }"
    @pointerdown="onPointerDown"
    @dblclick="fileListWidth = 0"
    @keydown="onKeydown"
  >
    <div
      class="mxa h-full w-0.5 rounded-full bg-current transition-opacity group-focus-visible:op-50 group-hover:op-30"
      :class="dragging ? '!op-50' : 'op-0'"
    />
  </div>
</template>
