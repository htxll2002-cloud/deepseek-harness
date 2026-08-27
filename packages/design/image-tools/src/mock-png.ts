/**
 * Deterministic RGB PNG encoder. No network, no Canvas, no extra dependency.
 * @module @deepseek-ai/dsh-image-tools/mock-png
 */

import { deflateSync } from 'node:zlib'
import type { AspectRatio } from './types.ts'

/** One RGB color. */
export interface Rgb {
  r: number
  g: number
  b: number
}

/** Pixel size for one aspect ratio. Kept small so attachment admission stays cheap. */
const ASPECT_SIZE: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 320, height: 320 },
  '4:3': { width: 320, height: 240 },
  '3:4': { width: 240, height: 320 },
  '16:9': { width: 320, height: 180 },
  '9:16': { width: 180, height: 320 },
}

/** Variant background colors. Visually distinct under any refresh. */
const VARIANT_COLORS: readonly Rgb[] = [
  { r: 36, g: 92, b: 196 },
  { r: 20, g: 140, b: 88 },
  { r: 196, g: 108, b: 24 },
  { r: 132, g: 52, b: 180 },
]

/** 5x7 glyphs for the mock labels. Missing glyphs become a space. */
const GLYPHS: Record<string, readonly number[]> = {
  ' ': [0, 0, 0, 0, 0],
  '-': [0, 0, 31, 0, 0],
  ':': [0, 10, 0, 0, 0],
  '.': [0, 0, 0, 0, 16],
  '[': [0, 62, 34, 34, 0],
  ']': [0, 34, 34, 62, 0],
  '/': [32, 16, 8, 4, 2],
  '0': [62, 81, 73, 69, 62],
  '1': [0, 66, 127, 64, 0],
  '2': [98, 81, 73, 73, 70],
  '3': [34, 65, 73, 73, 54],
  '4': [24, 20, 18, 127, 16],
  '5': [39, 69, 69, 69, 57],
  '6': [62, 73, 73, 73, 48],
  '7': [1, 113, 9, 5, 3],
  '8': [54, 73, 73, 73, 54],
  '9': [6, 73, 73, 73, 62],
  A: [126, 17, 17, 17, 126],
  B: [127, 73, 73, 73, 54],
  C: [62, 65, 65, 65, 34],
  D: [127, 65, 65, 65, 62],
  E: [127, 73, 73, 73, 65],
  F: [127, 9, 9, 9, 1],
  G: [62, 65, 73, 73, 58],
  H: [127, 8, 8, 8, 127],
  I: [0, 65, 127, 65, 0],
  J: [32, 64, 65, 63, 1],
  K: [127, 8, 20, 34, 65],
  L: [127, 64, 64, 64, 64],
  M: [127, 2, 12, 2, 127],
  N: [127, 4, 8, 16, 127],
  O: [62, 65, 65, 65, 62],
  P: [127, 9, 9, 9, 6],
  Q: [62, 65, 81, 33, 94],
  R: [127, 9, 25, 41, 70],
  S: [38, 73, 73, 73, 50],
  T: [1, 1, 127, 1, 1],
  U: [63, 64, 64, 64, 63],
  V: [31, 32, 64, 32, 31],
  W: [127, 32, 24, 32, 127],
  X: [99, 20, 8, 20, 99],
  Y: [7, 8, 112, 8, 7],
  Z: [97, 81, 73, 69, 67],
}

/** PNG file signature. */
const PNG_SIGNATURE = Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)

/**
 * Resolve canvas size for one aspect ratio.
 * @param aspect - allowlisted aspect ratio.
 * @returns pixel width and height.
 */
export function sizeForAspect(aspect: AspectRatio): { width: number; height: number } {
  return ASPECT_SIZE[aspect]
}

/**
 * Resolve the background color for one variant index.
 * @param variantIndex - zero-based variant.
 * @returns RGB background.
 */
export function colorForVariant(variantIndex: number): Rgb {
  const color = VARIANT_COLORS[variantIndex % VARIANT_COLORS.length]
  if (color === undefined) return { r: 40, g: 40, b: 40 }
  return color
}

/**
 * Encode a deterministic labeled PNG. Same inputs always produce the same bytes.
 * @param input - labels, aspect, variant, and optional edit stripe.
 * @returns PNG bytes.
 */
export function encodeLabeledPng(input: {
  lines: readonly string[]
  aspectRatio: AspectRatio
  variantIndex: number
  edit?: boolean
}): Uint8Array {
  const { width, height } = sizeForAspect(input.aspectRatio)
  const background = colorForVariant(input.variantIndex)
  const pixels = new Uint8Array(width * height * 3)
  fill(pixels, width, height, background)
  if (input.edit) stripe(pixels, width, height, { r: 255, g: 255, b: 255 })
  const ink: Rgb = { r: 255, g: 255, b: 255 }
  let y = 16
  for (const line of input.lines) {
    drawText(pixels, width, height, 12, y, asciiLabel(line), ink)
    y += 16
  }
  return encodeRgbPng(width, height, pixels)
}

/** Keep only characters the bitmap font can draw. */
function asciiLabel(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9 \-:\.\[\]/]/g, '?')
    .slice(0, 36)
}

function fill(pixels: Uint8Array, width: number, height: number, color: Rgb): void {
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 3
    pixels[offset] = color.r
    pixels[offset + 1] = color.g
    pixels[offset + 2] = color.b
  }
}

function stripe(pixels: Uint8Array, width: number, height: number, color: Rgb): void {
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < width; x += 1) {
      setPixel(pixels, width, height, x, y, color)
    }
  }
}

function drawText(
  pixels: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number,
  text: string,
  color: Rgb,
): void {
  let x = startX
  for (const char of text) {
    const glyph = GLYPHS[char] ?? GLYPHS[' ']
    if (glyph === undefined) continue
    for (let column = 0; column < 5; column += 1) {
      const bits = glyph[column] ?? 0
      for (let row = 0; row < 7; row += 1) {
        if (((bits >> row) & 1) === 1) {
          setPixel(pixels, width, height, x + column, startY + row, color)
        }
      }
    }
    x += 6
  }
}

function setPixel(
  pixels: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  color: Rgb,
): void {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  const offset = (y * width + x) * 3
  pixels[offset] = color.r
  pixels[offset + 1] = color.g
  pixels[offset + 2] = color.b
}

function encodeRgbPng(width: number, height: number, rgb: Uint8Array): Uint8Array {
  const raw = new Uint8Array((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1)
    raw[row] = 0
    raw.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), row + 1)
  }
  const ihdr = new Uint8Array(13)
  writeU32(ihdr, 0, width)
  writeU32(ihdr, 4, height)
  ihdr[8] = 8
  ihdr[9] = 2
  const chunks = [
    PNG_SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', new Uint8Array(0)),
  ]
  return concat(chunks)
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = encodeLatin1(type)
  const body = concat([typeBytes, data])
  const out = new Uint8Array(12 + data.length)
  writeU32(out, 0, data.length)
  out.set(body, 4)
  writeU32(out, 8 + data.length, crc32(body))
  return out
}

function encodeLatin1(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff
  return bytes
}

function writeU32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = (value >>> 24) & 0xff
  target[offset + 1] = (value >>> 16) & 0xff
  target[offset + 2] = (value >>> 8) & 0xff
  target[offset + 3] = value & 0xff
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of data) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) === 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}
