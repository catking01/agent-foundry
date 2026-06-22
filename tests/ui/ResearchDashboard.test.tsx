/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ResearchDashboard from '../../src/ui/ResearchDashboard'
import App from '../../src/App'

afterEach(() => {
  cleanup()
})

describe('ResearchDashboard', () => {
  it('renders G27 and G28 study headings', () => {
    render(<ResearchDashboard />)

    expect(screen.getByText('Deterministic study results')).toBeTruthy()
    expect(screen.getAllByText('G27 Flat vs Hierarchy').length).toBeGreaterThan(0)
    expect(screen.getByText('G28 Intervention Ranking')).toBeTruthy()
  })

  it('renders intervention ranking and delta metrics', () => {
    render(<ResearchDashboard />)

    expect(screen.getAllByText('Best quality intervention').length).toBeGreaterThan(0)
    expect(screen.getAllByText('merge_plus').length).toBeGreaterThan(0)
    expect(screen.getByText('Delta metrics')).toBeTruthy()
    expect(screen.getAllByText('Delta Quality').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Delta Latent Risk').length).toBeGreaterThan(0)
  })

  it('renders risk semantics warning and non-claims', () => {
    render(<ResearchDashboard />)

    expect(screen.getAllByText(/detectedOverclaimFindings is a DETECTION metric/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Latent risk is the preferred risk-outcome metric/i)).toBeTruthy()
    expect(screen.getByText('Non-claims')).toBeTruthy()
    expect(screen.getAllByText(/not real organization proof/i).length).toBeGreaterThan(0)
  })

  it('renders the G31 policy search dashboard section', () => {
    render(<ResearchDashboard />)

    expect(screen.getByText('Deterministic policy search results')).toBeTruthy()
    expect(screen.getByText('G30 Organization Policy Search')).toBeTruthy()
    expect(screen.getByText('Objective rankings')).toBeTruthy()
    expect(screen.getByText('Pareto frontier')).toBeTruthy()
    expect(screen.getByText('Scoring policy')).toBeTruthy()
  })

  it('does not render mutation controls', () => {
    const { container } = render(<ResearchDashboard />)
    const text = container.textContent ?? ''

    expect(text).not.toContain('Start')
    expect(text).not.toContain('Apply')
    expect(text).not.toContain('Run intervention')
    expect(container.querySelector('button')).toBeNull()
  })
})

describe('App Research tab', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('includes a Research tab that renders the dashboard', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Research' }))

    expect(screen.getByText('Deterministic study results')).toBeTruthy()
    expect(screen.getByText('G28 Intervention Ranking')).toBeTruthy()
    expect(screen.getByText('Deterministic policy search results')).toBeTruthy()
  })
})
