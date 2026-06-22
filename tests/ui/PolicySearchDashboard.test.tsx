/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import PolicySearchDashboard from '../../src/ui/PolicySearchDashboard'

afterEach(() => {
  cleanup()
})

describe('PolicySearchDashboard', () => {
  it('renders G30 matrix shape and run count', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Deterministic policy search results')).toBeTruthy()
    expect(screen.getByText('G30 Organization Policy Search')).toBeTruthy()
    expect(screen.getAllByText(/288/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/12 policies/).length).toBeGreaterThan(0)
  })

  it('renders objective rankings for all 5 objectives', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Objective rankings')).toBeTruthy()
    expect(screen.getAllByText('Speed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Quality').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Risk Reduction').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Coordination Efficiency').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Balanced').length).toBeGreaterThan(0)

    expect(screen.getAllByText('speed_flat_like').length).toBeGreaterThan(0)
    expect(screen.getAllByText('merge_optimized').length).toBeGreaterThan(0)
    expect(screen.getAllByText('risk_averse_org').length).toBeGreaterThan(0)
    expect(screen.getAllByText('audit_heavy').length).toBeGreaterThan(0)
  })

  it('renders Pareto frontier and highlights', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Pareto frontier')).toBeTruthy()
    expect(screen.getByText('Frontier highlights')).toBeTruthy()
    expect(screen.getByText('Frontier size')).toBeTruthy()
    expect(screen.getByText(/8 of 12 policies/)).toBeTruthy()
    expect(screen.getByText(/Dominated policies:/)).toBeTruthy()
  })

  it('renders order complexity breakdown for all 3 classes', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Order complexity breakdown')).toBeTruthy()
    expect(screen.getByText('simple')).toBeTruthy()
    expect(screen.getAllByText('medium').length).toBeGreaterThan(0)
    expect(screen.getAllByText('complex').length).toBeGreaterThan(0)
  })

  it('renders policy config details for all 12 policies', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Policy config details')).toBeTruthy()
    expect(screen.getByText('Baseline hierarchical')).toBeTruthy()
    expect(screen.getByText('Speed flat-like')).toBeTruthy()
    expect(screen.getByText('Risk-averse org')).toBeTruthy()
    expect(screen.getByText('Balanced org')).toBeTruthy()
  })

  it('renders scoring policy weight table', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Scoring policy')).toBeTruthy()
    expect(screen.getByText('Formula')).toBeTruthy()
    expect(screen.getByText('Interpretation')).toBeTruthy()
    expect(screen.getByText('speedScore = -deliveryTicks')).toBeTruthy()
    expect(screen.getByText(/riskReductionScore = -latentRiskEstimate/)).toBeTruthy()
  })

  it('renders risk semantics warning', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getAllByText('Risk semantics').length).toBeGreaterThan(0)
    // Should contain the DETECTION/EXPOSURE language
    const text = screen.getByText(/EXPOSURE metric/i)
    expect(text).toBeTruthy()
  })

  it('renders non-claims section', () => {
    render(<PolicySearchDashboard />)

    expect(screen.getByText('Non-claims')).toBeTruthy()
    expect(screen.getByText(/deterministic simulation/)).toBeTruthy()
    expect(screen.getByText(/not real AI agents/)).toBeTruthy()
    expect(screen.getByText(/no claim that any single policy/)).toBeTruthy()
  })

  it('does not render mutation controls', () => {
    const { container } = render(<PolicySearchDashboard />)
    const text = container.textContent ?? ''

    expect(text).not.toContain('Start')
    expect(text).not.toContain('Apply')
    expect(text).not.toContain('Run policy')
    expect(text).not.toContain('Dispatch')
    expect(container.querySelector('button')).toBeNull()
  })

  it('is read-only with no interactive controls', () => {
    const { container } = render(<PolicySearchDashboard />)

    const inputs = container.querySelectorAll('input')
    const selects = container.querySelectorAll('select')
    const buttons = container.querySelectorAll('button')

    expect(inputs.length).toBe(0)
    expect(selects.length).toBe(0)
    expect(buttons.length).toBe(0)
  })
})
