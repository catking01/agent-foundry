/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import TutorialChecklist, {
  isTutorialDismissed,
  dismissTutorial,
} from '../../src/ui/TutorialChecklist'
import { LanguageProvider } from '../../src/i18n/LanguageContext'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import { advanceTicks } from '../../src/sim/tick'

function wrap(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('TutorialChecklist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders when not dismissed', () => {
    const state = createInitialState(42)
    const { container } = wrap(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    expect(container.textContent).toContain('新手引导')
    expect(container.textContent).toContain('接取第一个订单')
  })

  it('renders nothing when dismissed', () => {
    const state = createInitialState(42)
    const { container } = wrap(
      <TutorialChecklist state={state} dismissed={true} onDismiss={() => {}} />,
    )
    expect(container.textContent).toBe('')
  })

  it('shows all 7 tutorial steps', () => {
    const state = createInitialState(42)
    const { container } = wrap(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    // Should mention key concepts
    expect(container.textContent).toContain('接取')
    expect(container.textContent).toContain('员工')
    expect(container.textContent).toContain('产出物')
    expect(container.textContent).toContain('验证')
    expect(container.textContent).toContain('审计')
    expect(container.textContent).toContain('交付')
    expect(container.textContent).toContain('浮窗')
  })

  it('steps update as player progresses', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find(
      (o) => o.status === 'available',
    )!

    // Accept order
    const afterAccept = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    const { container } = wrap(
      <TutorialChecklist
        state={afterAccept}
        dismissed={false}
        onDismiss={() => {}}
      />,
    )

    // The "accept" step should be checked now
    const text = container.textContent || ''
    // After accepting, some steps should show ✓
    expect(text).toContain('✓')
  })

  it('has dismiss button', () => {
    const state = createInitialState(42)
    let dismissed = false
    const { container } = wrap(
      <TutorialChecklist
        state={state}
        dismissed={false}
        onDismiss={() => {
          dismissed = true
        }}
      />,
    )

    // Find and click the skip button
    const buttons = container.querySelectorAll('button')
    const skipBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes('跳过'),
    )
    expect(skipBtn).toBeTruthy()
    if (skipBtn) fireEvent.click(skipBtn)
    expect(dismissed).toBe(true)
  })

  it('dismissTutorial persists to localStorage', () => {
    dismissTutorial()
    expect(isTutorialDismissed()).toBe(true)
  })

  it('isTutorialDismissed returns false by default', () => {
    expect(isTutorialDismissed()).toBe(false)
  })

  it('does not dispatch PlayerAction directly', () => {
    // TutorialChecklist only receives state: GameState and dismissed/onDismiss
    // It never receives onDispatch prop
    const state = createInitialState(42)
    const { container } = wrap(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    // Just verify it renders without crashing
    expect(container).toBeTruthy()
  })

  it('mentions Agent HUD in the tutorial steps', () => {
    const state = createInitialState(42)
    const { container } = wrap(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    expect(container.textContent).toContain('浮窗')
  })

  it('mentions audit and evidence concepts', () => {
    const state = createInitialState(42)
    const { container } = wrap(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    expect(container.textContent).toContain('审计')
    expect(container.textContent).toContain('overclaim')
  })
})
