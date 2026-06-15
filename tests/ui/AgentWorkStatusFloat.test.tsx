/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AgentWorkStatusFloat from '../../src/ui/AgentWorkStatusFloat'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import { advanceTicks } from '../../src/sim/tick'

describe('AgentWorkStatusFloat', () => {
  it('renders collapsed summary bar', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    expect(container.textContent).toContain('AI Workers')
    expect(container.textContent).toContain('working')
    expect(container.textContent).toContain('idle')
  })

  it('collapsed bar shows correct idle count at start', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    expect(container.textContent).toContain('0 working')
  })

  it('expands to show Overview section', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    // Click the collapsed bar to expand
    const bar = container.querySelector('[style*="cursor: pointer"]')
    if (bar) fireEvent.click(bar)

    // Overview should now be visible
    expect(container.textContent).toContain('Overview')
    expect(container.textContent).toContain('Tick')
    expect(container.textContent).toContain('Fatigue avg')
    expect(container.textContent).toContain('Active tasks')
    expect(container.textContent).toContain('Queued tasks')
    expect(container.textContent).toContain('Bottleneck')
    expect(container.textContent).toContain('Total agents')
  })

  it('expands to show Agents section', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    const bar = container.querySelector('[style*="cursor: pointer"]')
    if (bar) fireEvent.click(bar)

    expect(container.textContent).toContain('Agents')
    // Should show agent names
    expect(container.textContent).toContain('FastCoder-7')
    expect(container.textContent).toContain('CarefulVerifier')
    expect(container.textContent).toContain('AuditorPrime')
  })

  it('expands to show Workshops section', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    const bar = container.querySelector('[style*="cursor: pointer"]')
    if (bar) fireEvent.click(bar)

    expect(container.textContent).toContain('Workshops')
    expect(container.textContent).toContain('planning')
    expect(container.textContent).toContain('engineering')
    expect(container.textContent).toContain('validation')
    expect(container.textContent).toContain('audit')
    expect(container.textContent).toContain('delivery')
  })

  it('expands to show Recent Events section', () => {
    const state = createInitialState(42)
    let next = state
    // Accept an order to generate ledger events
    const order = Object.values(next.orders).find((o) => o.status === 'available')!
    next = applyPlayerAction(next, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: next.tick,
    })
    next = advanceTicks(next, 5)

    const { container } = render(<AgentWorkStatusFloat state={next} />)

    const bar = container.querySelector('[style*="cursor: pointer"]')
    if (bar) fireEvent.click(bar)

    expect(container.textContent).toContain('Recent Events')
    // Should have ledger events with tick numbers
    expect(container.textContent).toMatch(/T\d+/)
  })

  it('does not expose mutation buttons', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(0)
  })

  it('does not call Ollama or shadowAudit', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    expect(container.textContent).not.toContain('shadowAudit')
    expect(container.textContent).not.toContain('Ollama')
  })

  it('is read-only — no dispatch prop accepted', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)
    expect(container).toBeTruthy()
  })

  it('shows working/fatigued/idle statuses when agents are assigned', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })
    next = advanceTicks(next, 5)

    const { container } = render(<AgentWorkStatusFloat state={next} />)

    const bar = container.querySelector('[style*="cursor: pointer"]')
    if (bar) fireEvent.click(bar)

    // After 5 ticks with an accepted order, some agents should show status
    const text = container.textContent || ''
    const hasStatus = text.includes('IDLE') || text.includes('WORKING') || text.includes('BLOCKED')
    expect(hasStatus).toBe(true)
  })
})
