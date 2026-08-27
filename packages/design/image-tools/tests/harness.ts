/**
 * Lightweight tool + local attachment bench for image-tool unit specs.
 */

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import LocalAttachmentStore from '@deepseek-ai/dsh-attachment-local'
import { CallId, createToolResultMessage } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import * as imageTools from '../src/index.ts'
import type { EditImageValue, GenerateImageValue } from '../src/types.ts'

const signal = new AbortController().signal
let homes: string[] = []
let calls = 0

/** Boot tools + official local attachments. */
export async function setupImageTools(): Promise<Context> {
  const dshHome = await mkdtemp(join(tmpdir(), 'dsh-image-tools-'))
  homes.push(dshHome)
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  await ctx.plugin(LocalAttachmentStore, { dshHome })
  await ctx.plugin(imageTools)
  return ctx
}

/** Dispose temp attachment homes created by this file. */
export async function closeImageToolHomes(): Promise<void> {
  const pending = homes
  homes = []
  await Promise.all(pending.map(home => rm(home, { recursive: true, force: true })))
}

/** A parent Agent backed by a real Session. */
export function agentWithSession(id = 'design-1'): Agent & { session: Session } {
  const session = Session.create(SessionId(id))
  return { id: SessionId(id), session } as unknown as Agent & { session: Session }
}

/** Execute a registered image tool. */
export function executeImageTool(
  ctx: Context,
  name: string,
  args: unknown,
  agent?: Agent,
) {
  calls += 1
  return ctx.tools.execute({
    signal,
    callId: CallId(`image-${String(calls)}`),
    name,
    arguments: args,
    ...agent === undefined ? {} : { agent },
  })
}

/** Record generated image refs onto the session so edit_image can find them. */
export function recordGeneratedImages(
  agent: Agent & { session: Session },
  value: GenerateImageValue,
  callId = 'seed-generate',
): void {
  agent.session.append('tool/result', {
    turn: 1,
    step: 1,
    message: createToolResultMessage({
      callId: CallId(callId),
      content: value.images.map(item => ({ type: 'image' as const, attachment: item.attachment })),
      isError: false,
    }),
  }, { surfaceOp: 'append' })
}

/** Unwrap a successful generate result. */
export function generateValue(result: { isError: boolean; value?: unknown }): GenerateImageValue {
  if (result.isError) throw new Error('expected generate_image success')
  return result.value as GenerateImageValue
}

/** Unwrap a successful edit result. */
export function editValue(result: { isError: boolean; value?: unknown }): EditImageValue {
  if (result.isError) throw new Error('expected edit_image success')
  return result.value as EditImageValue
}

export type { ImageAttachmentRef }
