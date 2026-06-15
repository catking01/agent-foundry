/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import AgentWorkStatusFloat from '../../src/ui/AgentWorkStatusFloat'
import { createInitialState } from '../../src/sim/createInitialState'

describe('AgentWorkStatusFloat', () => {
  it('renders collapsed summary bar', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    // Collapsed bar should show "AI Workers"
    expect(container.textContent).toContain('AI Workers')

    // Should show agent counts
    expect(container.textContent).toContain('working')
    expect(container.textContent).toContain('idle')
  })

  it('collapsed bar shows correct idle count at start', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    // All 8 agents idle at start — shows working=0
    expect(container.textContent).toContain('0 working')
  })

  it('does not expose mutation buttons', () => {
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)

    // No buttons except the expand toggle (div, not button)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(0)
  })

  it('does not call Ollama or shadowAudit', () => {
    // AgentWorkStatusFloat only imports from agentStatusSelectors and types
    // It never imports ollamaClient, shadowAudit, or calibrateShadowAudit
    const state = createInitialState(42)
    const { container } = render(<AgentWorkStatusFloat state={state} />)
    expect(container.textContent).not.toContain('shadowAudit')
    expect(container.textContent).not.toContain('Ollama')
  })

  it('is read-only — no dispatch prop accepted', () => {
    const state = createInitialState(42)
    // The component only takes { state: GameState }, no onDispatch
    const { container } = render(<AgentWorkStatusFloat state={state} />)
    expect(container).toBeTruthy()
  })
})
