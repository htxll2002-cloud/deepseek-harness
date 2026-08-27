import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { DesignImageStore } from './store.ts'
import { stripEditSourceToken } from './source-token.ts'
import css from './EditingChip.module.css'

type EditingChipProps =
  PropsRuntime<'conversation.input.dock'>
  & PropsStore<DesignImageStore>
  & PropsLocale<'designImage'>

/** Composer dock chip for the M2 Continue Editing source. */
export function EditingChip(props: EditingChipProps) {
  const editingAttachmentId = props.useStore(state => state.editingAttachmentId)
  if (editingAttachmentId === null) return null
  const draft = props.useInput(state => state.draft)
  return (
    <div className={css.chip}>
      <div className={css.body}>
        <div className={css.label}>{props.t('chip.editing')}</div>
        <div className={css.id}>{editingAttachmentId}</div>
      </div>
      <button
        type="button"
        className={css.clear}
        onClick={() => {
          props.actions.clearEditing()
          props.inputActions.setDraft(stripEditSourceToken(draft))
        }}
      >
        {props.t('chip.clear')}
      </button>
    </div>
  )
}
