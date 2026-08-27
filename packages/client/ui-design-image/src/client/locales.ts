/** `designImage` namespace dictionaries. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'title.generate': '已生成图片',
  'title.edit': '已编辑图片',
  'state.generating': '正在生成图片…',
  'state.loading': '正在加载图片…',
  'state.error': '图片生成失败',
  'state.loadFailed': '图片读取失败',
  'meta.from': '编辑自',
  'action.select': '选择',
  'action.selected': '已选择',
  'action.preview': '预览',
  'action.download': '下载',
  'action.continue': '继续编辑',
  'action.closePreview': '关闭预览',
  'chip.editing': '正在编辑所选图片',
  'chip.clear': '清除',
} satisfies Record<string, string>

/** The designImage namespace key union. */
export type DesignImageKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'title.generate': 'Generated images',
  'title.edit': 'Edited images',
  'state.generating': 'Generating images…',
  'state.loading': 'Loading images…',
  'state.error': 'Image generation failed',
  'state.loadFailed': 'Failed to load image',
  'meta.from': 'Edited from',
  'action.select': 'Select',
  'action.selected': 'Selected',
  'action.preview': 'Preview',
  'action.download': 'Download',
  'action.continue': 'Continue Editing',
  'action.closePreview': 'Close preview',
  'chip.editing': 'Editing selected image',
  'chip.clear': 'Clear',
} satisfies Record<DesignImageKey, string>

/** Dictionary namespace owned by this plugin. */
export const NS = 'designImage'
