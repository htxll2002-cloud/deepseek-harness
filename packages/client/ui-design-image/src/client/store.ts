/**
 * Session-local spike selection. Not product artifact truth.
 */

import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

/** Viewing state for one conversation's image spike. */
export interface DesignImageState {
  /** Variant the user last marked selected. */
  selectedAttachmentId: string | null
  /** Source that Continue Editing will send on the next edit. */
  editingAttachmentId: string | null
}

type DesignImageActions = {
  select: (draft: DesignImageState, attachmentId: string) => void
  continueEditing: (draft: DesignImageState, attachmentId: string) => void
  clearEditing: (draft: DesignImageState) => void
}

/**
 * Per-session spike store. No persist key — completed images replay from the
 * session tool result, not from this viewing state.
 * @returns a session-local store handle.
 */
export function createDesignImageStore(): EngineStoreHandle<DesignImageState, DesignImageActions> {
  return defineStore({
    init: (): DesignImageState => ({ selectedAttachmentId: null, editingAttachmentId: null }),
    actions: {
      select: (draft, attachmentId: string) => {
        draft.selectedAttachmentId = attachmentId
      },
      continueEditing: (draft, attachmentId: string) => {
        draft.selectedAttachmentId = attachmentId
        draft.editingAttachmentId = attachmentId
      },
      clearEditing: (draft) => {
        draft.editingAttachmentId = null
      },
    },
  })
}

/** Session-local spike store handle. */
export type DesignImageStore = ReturnType<typeof createDesignImageStore>
