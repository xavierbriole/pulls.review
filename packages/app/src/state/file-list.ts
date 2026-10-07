import { useLocalStorage } from '@vueuse/core'

export type FileListLayout = 'tree' | 'list'

/** How each group's sidebar lists its files: nested by folder, or flat in diff order. */
export const fileListLayout = useLocalStorage<FileListLayout>('diffs:file-list', 'tree')

/**
 * Width in px of every group's file sidebar, dragged by its resize handle. `0` keeps the
 * default proportional column; one value for all groups so their diffs stay aligned.
 */
export const fileListWidth = useLocalStorage('diffs:file-list-width', 0)

/** Share of a group's row the file column may take, so the diffs always keep some room. */
export const FILE_LIST_MAX_RATIO = 0.6

/**
 * CSS width of a dragged file column, capped to `FILE_LIST_MAX_RATIO` of `row` so a width
 * picked on a wide window doesn't squeeze the diffs once the window narrows.
 */
export function fileListColumn(width: number, row = '100%') {
  return `min(${width}px, ${row} * ${FILE_LIST_MAX_RATIO})`
}
