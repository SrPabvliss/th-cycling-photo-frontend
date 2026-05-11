import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useWorkspaceKeyboard, type ShortcutHandlers } from './use-workspace-keyboard'

function setup(overrides: Partial<ShortcutHandlers> = {}) {
  const handlers: ShortcutHandlers = {
    onSaveAdvance: vi.fn(),
    onSaveCard: vi.fn(),
    onCancelEdit: vi.fn(),
    onNextCard: vi.fn(),
    onPrevCard: vi.fn(),
    onNextPhoto: vi.fn(),
    onPrevPhoto: vi.fn(),
    onJumpSection: vi.fn(),
    onAddManual: vi.fn(),
    onShowCrop: vi.fn(),
    onTogglePending: vi.fn(),
    onDownload: vi.fn(),
    onUpload: vi.fn(),
    onResetZoom: vi.fn(),
    onToggleCompare: vi.fn(),
    onShowCheatsheet: vi.fn(),
    onExit: vi.fn(),
    ...overrides,
  }
  const Comp = defineComponent({
    setup() {
      useWorkspaceKeyboard(handlers)
      return () => h('div')
    },
  })
  const wrapper = mount(Comp)
  return { handlers, wrapper }
}

function fireKey(key: string, opts: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }))
}

describe('useWorkspaceKeyboard', () => {
  it('Cmd+Enter (no input) calls onSaveAdvance', () => {
    const { handlers } = setup()
    fireKey('Enter', { metaKey: true })
    expect(handlers.onSaveAdvance).toHaveBeenCalled()
  })

  it('plain Enter (no input) does NOT call onSaveAdvance', () => {
    const { handlers } = setup()
    fireKey('Enter')
    expect(handlers.onSaveAdvance).not.toHaveBeenCalled()
  })

  it('ArrowDown calls onNextCard, ArrowUp calls onPrevCard', () => {
    const { handlers } = setup()
    fireKey('ArrowDown')
    expect(handlers.onNextCard).toHaveBeenCalled()
    fireKey('ArrowUp')
    expect(handlers.onPrevCard).toHaveBeenCalled()
  })

  it('1/2/3 trigger onJumpSection (used by compare-mode view switching)', () => {
    const { handlers } = setup()
    fireKey('1')
    expect(handlers.onJumpSection).toHaveBeenCalledWith('bibs')
    fireKey('2')
    expect(handlers.onJumpSection).toHaveBeenCalledWith('helmet')
    fireKey('3')
    expect(handlers.onJumpSection).toHaveBeenCalledWith('cyclist_clothes')
  })

  it('Space triggers onShowCrop', () => {
    const { handlers } = setup()
    fireKey(' ')
    expect(handlers.onShowCrop).toHaveBeenCalled()
  })

  it('A calls onAddManual (case-insensitive)', () => {
    const { handlers } = setup()
    fireKey('a')
    fireKey('A')
    expect(handlers.onAddManual).toHaveBeenCalledTimes(2)
  })

  it('? always shows cheatsheet', () => {
    const { handlers } = setup()
    fireKey('?')
    expect(handlers.onShowCheatsheet).toHaveBeenCalled()
  })

  it('does not trigger card nav when input is focused', () => {
    const { handlers } = setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(handlers.onNextCard).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('Cmd+Enter in input calls onSaveCard', () => {
    const { handlers } = setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }),
    )
    expect(handlers.onSaveCard).toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('Esc in input calls onCancelEdit', () => {
    const { handlers } = setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(handlers.onCancelEdit).toHaveBeenCalled()
    document.body.removeChild(input)
  })
})
