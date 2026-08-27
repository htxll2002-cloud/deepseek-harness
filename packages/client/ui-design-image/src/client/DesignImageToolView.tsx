import { useState } from 'react'
import clsx from 'clsx'
import type { ISession } from '@deepseek-ai/dsh-client-runtime/client'
import type { InjectFace, PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { DesignImageStore } from './store.ts'
import { parseDesignImageBlock, type DesignImageVariant } from './parse-result.ts'
import { draftWithEditSource } from './source-token.ts'
import { useAttachmentUrl } from './use-attachment-url.ts'
import css from './DesignImageToolView.module.css'
import type { DesignImageKey } from './locales.ts'

/** Session attachment reader supplied through the official inject face. */
export interface DesignImageReadFace {
  readAttachment: ISession['readAttachment']
}

type DesignImageToolViewProps =
  PropsRuntime<'tool.call.toolview'>
  & PropsStore<DesignImageStore>
  & PropsLocale<'designImage'>
  & InjectFace<DesignImageReadFace>

/** Official keyed Tool View for generate_image and edit_image. */
export function DesignImageToolView(props: DesignImageToolViewProps) {
  const model = parseDesignImageBlock(props.toolName, props.block)
  const selected = props.useStore(state => state.selectedAttachmentId)
  const draft = props.useInput(state => state.draft)
  const title = props.t(model.operation === 'edit' ? 'title.edit' : 'title.generate')
  const gridClass = model.images.length <= 1
    ? css.gridOne
    : model.images.length === 2
      ? css.gridTwo
      : css.gridFour

  return (
    <section className={css.card} aria-label={title}>
      <div className={css.title}>{title}</div>
      {model.prompt !== '' ? <div className={css.prompt}>{model.prompt}</div> : null}
      {model.sourceAttachmentId !== undefined
        ? <div className={css.source}>{props.t('meta.from')}: {model.sourceAttachmentId}</div>
        : null}
      {model.status === 'running' ? <div className={css.status}>{props.t('state.generating')}</div> : null}
      {model.status === 'error' ? <div className={css.error}>{model.errorText ?? props.t('state.error')}</div> : null}
      {model.images.length > 0
        ? (
          <div className={clsx(css.grid, gridClass)}>
            {model.images.map(image => (
              <VariantCard
                key={image.attachmentId}
                image={image}
                selected={selected === image.attachmentId}
                t={props.t}
                readAttachment={props.readAttachment}
                onSelect={() => { props.actions.select(image.attachmentId) }}
                onContinue={() => {
                  props.actions.continueEditing(image.attachmentId)
                  props.inputActions.setDraft(draftWithEditSource(draft, image.attachmentId))
                }}
              />
            ))}
          </div>
        )
        : null}
    </section>
  )
}

function VariantCard(props: {
  image: DesignImageVariant
  selected: boolean
  t: (key: DesignImageKey) => string
  readAttachment: ISession['readAttachment'] | undefined
  onSelect: () => void
  onContinue: () => void
}) {
  const [preview, setPreview] = useState(false)
  const loaded = useAttachmentUrl(props.readAttachment, props.image.attachmentId)
  const label = props.image.name ?? `Variant ${String(props.image.variantIndex + 1)}`

  const download = (): void => {
    if (loaded.url === undefined) return
    const link = document.createElement('a')
    link.href = loaded.url
    link.download = props.image.name ?? `${props.image.attachmentId}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <article className={clsx(css.variant, props.selected && css.variantSelected)}>
      {loaded.error !== undefined ? <div className={css.error}>{props.t('state.loadFailed')}</div> : null}
      {loaded.url === undefined && loaded.error === undefined
        ? <div className={css.status}>{props.t('state.loading')}</div>
        : null}
      {loaded.url !== undefined
        ? (
          <button type="button" className={css.imageButton} onClick={() => { setPreview(true) }}>
            <img className={css.image} src={loaded.url} alt={label} />
          </button>
        )
        : null}
      <div className={css.actions}>
        <button
          type="button"
          className={clsx(css.button, props.selected && css.buttonSelected)}
          onClick={props.onSelect}
        >
          {props.selected ? props.t('action.selected') : props.t('action.select')}
        </button>
        <button type="button" className={css.button} onClick={props.onContinue}>
          {props.t('action.continue')}
        </button>
        <button type="button" className={css.button} disabled={loaded.url === undefined} onClick={download}>
          {props.t('action.download')}
        </button>
      </div>
      {preview && loaded.url !== undefined
        ? (
          <div className={css.lightbox} onClick={() => { setPreview(false) }}>
            <img
              className={css.lightboxImage}
              src={loaded.url}
              alt={label}
              onClick={(event) => { event.stopPropagation() }}
            />
          </div>
        )
        : null}
    </article>
  )
}
