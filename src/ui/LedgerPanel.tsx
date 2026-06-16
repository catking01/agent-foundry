import React, { useState, useMemo } from 'react'
import type { GameState } from '../sim/types'
import { useLang } from '../i18n/LanguageContext'

interface Props { state: GameState }

export default function LedgerPanel({ state }: Props) {
  const { t } = useLang()
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)

  const events = useMemo(() => {
    const all = state.ledger.slice().reverse()
    if (filter) {
      const lower = filter.toLowerCase()
      return all.filter((e) => e.eventType.toLowerCase().includes(lower) || e.actorId.toLowerCase().includes(lower) || e.targetId.toLowerCase().includes(lower))
    }
    return showAll ? all : all.slice(0, 100)
  }, [state.ledger, filter, showAll])

  return (
    <div>
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, border: 'none', padding: 0 }}>{t('ledger')} ({state.ledger.length})</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="text" placeholder={t('filter') + '...'} value={filter} onChange={(e) => setFilter(e.target.value)}
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 11, width: 180 }} />
            <button className="small" onClick={() => setShowAll(!showAll)}>
              {showAll ? t('recent') : `${t('all')} (${state.ledger.length})`}
            </button>
          </div>
        </div>
        <div className="scrollable" style={{ maxHeight: 500 }}>
          {events.length === 0 && <div style={{ color: 'var(--text-dim)', padding: 16, textAlign: 'center' }}>{t('noEvents')}</div>}
          {events.map((event, i) => (
            <div key={`${event.tick}-${i}`} className="ledger-entry">
              <span className="ledger-tick">T{event.tick}</span>
              <span className="ledger-type">{event.eventType}</span>
              <span className="ledger-detail">
                {t('actor')}={event.actorId} {t('target')}={event.targetId}
                {Object.entries(event.details).length > 0 && ` ${JSON.stringify(event.details)}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>{t('eventType')}</h2>
        <EventSummary events={state.ledger} />
      </div>
    </div>
  )
}

function EventSummary({ events }: { events: GameState['ledger'] }) {
  const { t } = useLang()
  const counts: Record<string, number> = {}
  for (const e of events) counts[e.eventType] = (counts[e.eventType] || 0) + 1
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <table className="data-table">
      <thead><tr><th>{t('eventType')}</th><th>{t('count')}</th></tr></thead>
      <tbody>
        {sorted.map(([type, count]) => (<tr key={type}><td style={{ color: 'var(--accent)' }}>{type}</td><td>{count}</td></tr>))}
        {sorted.length === 0 && <tr><td colSpan={2} style={{ color: 'var(--text-dim)', textAlign: 'center' }}>{t('noEvents')}</td></tr>}
      </tbody>
    </table>
  )
}
