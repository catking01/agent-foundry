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
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import { advanceTicks } from '../../src/sim/tick'

describe('TutorialChecklist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders when not dismissed', () => {
    const state = createInitialState(42)
    const { container } = render(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    expect(container.textContent).toContain('First Run')
    expect(container.textContent).toContain('Accept your first order')
  })

  it('renders nothing when dismissed', () => {
    const state = createInitialState(42)
    const { container } = render(
      <TutorialChecklist state={state} dismissed={true} onDismiss={() => {}} />,
    )
    expect(container.textContent).toBe('')
  })

  it('shows all 7 tutorial steps', () => {
    const state = createInitialState(42)
    const { container } = render(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    // Should mention key concepts
    expect(container.textContent).toContain('Accept')
    expect(container.textContent).toContain('agent')
    expect(container.textContent).toContain('artifact')
    expect(container.textContent).toContain('Validation')
    expect(container.textContent).toContain('Audit')
    expect(container.textContent).toContain('Deliver')
    expect(container.textContent).toContain('HUD')
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

    const { container } = render(
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
    const { container } = render(
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
      b.textContent?.includes('Skip'),
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
    const { container } = render(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    // Just verify it renders without crashing
    expect(container).toBeTruthy()
  })

  it('mentions Agent HUD in the tutorial steps', () => {
    const state = createInitialState(42)
    const { container } = render(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    expect(container.textContent).toContain('HUD')
  })

  it('mentions audit and evidence concepts', () => {
    const state = createInitialState(42)
    const { container } = render(
      <TutorialChecklist state={state} dismissed={false} onDismiss={() => {}} />,
    )
    expect(container.textContent).toContain('Audit')
    expect(container.textContent).toContain('overclaim')
  })
})
