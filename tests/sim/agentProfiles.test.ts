import { describe, it, expect } from 'vitest'
import {
  createDefaultWorkerProfile,
  createDefaultLeadProfile,
  isLeadProfile,
  createDefaultCapability,
  createDefaultWorkStyle,
  createDefaultEvidenceDiscipline,
  createDefaultCommunication,
  createDefaultLeadership,
  createDefaultAgentState,
} from '../../src/sim/agentProfiles'
import {
  AGENT_PROFILE_PRESETS,
  PROFILE_PRESET_META,
  FAST_EXECUTOR,
  BALANCED_CELL_LEAD,
} from '../../src/data/agentProfilePresets'

describe('Agent Profiles', () => {
  // --- Factory defaults ---

  it('worker profile has null leadership', () => {
    const profile = createDefaultWorkerProfile()
    expect(profile.leadership).toBeNull()
    expect(isLeadProfile(profile)).toBe(false)
  })

  it('lead profile has non-null leadership', () => {
    const profile = createDefaultLeadProfile()
    expect(profile.leadership).not.toBeNull()
    expect(profile.leadership!.spanOfControl).toBeGreaterThan(0)
    expect(isLeadProfile(profile)).toBe(true)
  })

  it('default capability has all skills at 5', () => {
    const cap = createDefaultCapability()
    expect(cap.planning).toBe(5)
    expect(cap.engineering).toBe(5)
    expect(cap.decomposition).toBe(5)
    expect(cap.synthesis).toBe(5)
  })

  it('default work style has all biases at 5', () => {
    const ws = createDefaultWorkStyle()
    expect(ws.speedBias).toBe(5)
    expect(ws.qualityBias).toBe(5)
    expect(ws.patience).toBe(5)
  })

  it('default evidence discipline has all at 5', () => {
    const ed = createDefaultEvidenceDiscipline()
    expect(ed.claimCalibration).toBe(5)
    expect(ed.overclaimTendency).toBe(5)
  })

  it('default communication has all at 5', () => {
    const comm = createDefaultCommunication()
    expect(comm.handoffClarity).toBe(5)
    expect(comm.contextRetention).toBe(5)
  })

  it('default leadership for cell_lead has span 4', () => {
    const lead = createDefaultLeadership()
    expect(lead.spanOfControl).toBe(4)
    expect(lead.delegationSkill).toBe(5)
  })

  it('default agent state starts fresh', () => {
    const state = createDefaultAgentState()
    expect(state.fatigue).toBe(0)
    expect(state.morale).toBe(7)
    expect(state.recentFailures).toBe(0)
  })

  // --- Presets ---

  it('all presets are registered', () => {
    const presetIds = Object.keys(AGENT_PROFILE_PRESETS)
    expect(presetIds.length).toBeGreaterThanOrEqual(6)
  })

  it('fast executor has high speed bias and overclaim tendency', () => {
    expect(FAST_EXECUTOR.workStyle.speedBias).toBeGreaterThan(7)
    expect(FAST_EXECUTOR.evidenceDiscipline.overclaimTendency).toBeGreaterThan(5)
    expect(FAST_EXECUTOR.leadership).toBeNull()
  })

  it('balanced cell lead has leadership profile', () => {
    expect(BALANCED_CELL_LEAD.leadership).not.toBeNull()
    expect(BALANCED_CELL_LEAD.leadership!.spanOfControl).toBeGreaterThanOrEqual(3)
  })

  it('presets match their meta role descriptions', () => {
    for (const [id, profile] of Object.entries(AGENT_PROFILE_PRESETS)) {
      const meta = PROFILE_PRESET_META[id]
      expect(meta).toBeDefined()
      expect(meta.name).toBeTruthy()
      expect(meta.role).toBeTruthy()

      // Worker presets should have null leadership
      if (meta.role === 'worker') {
        expect(profile.leadership).toBeNull()
      }
      // Lead presets should have leadership
      if (meta.role === 'cell_lead' || meta.role === 'workshop_lead') {
        expect(profile.leadership).not.toBeNull()
      }
    }
  })

  it('capability skills are within 0-10 range for all presets', () => {
    for (const profile of Object.values(AGENT_PROFILE_PRESETS)) {
      const cap = profile.capability
      const skills = [
        cap.planning, cap.engineering, cap.validation, cap.audit, cap.delivery,
        cap.decomposition, cap.synthesis, cap.evidenceReasoning, cap.errorDetection, cap.riskAssessment,
      ]
      for (const skill of skills) {
        expect(skill).toBeGreaterThanOrEqual(0)
        expect(skill).toBeLessThanOrEqual(10)
      }
    }
  })

  it('evidence discipline values are within 0-10 range for all presets', () => {
    for (const profile of Object.values(AGENT_PROFILE_PRESETS)) {
      const ed = profile.evidenceDiscipline
      const values = [
        ed.claimCalibration, ed.citationDiscipline, ed.uncertaintyReporting,
        ed.failureDisclosure, ed.hiddenFailureRisk, ed.overclaimTendency,
      ]
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(10)
      }
    }
  })
})
