import React from 'react'
import type { GameState, Order, PlayerAction } from '../sim/types'
import { useLang } from '../i18n/LanguageContext'
import {
  getAvailableOrders, getAcceptedOrders, getInProgressOrders,
  getDeliveredOrders, getFailedOrders,
} from '../game/selectors'

interface Props { state: GameState; onDispatch: (action: PlayerAction) => void }

export default function OrderBoard({ state, onDispatch }: Props) {
  const { t } = useLang()
  const available = getAvailableOrders(state)
  const accepted = getAcceptedOrders(state)
  const inProgress = getInProgressOrders(state)
  const delivered = getDeliveredOrders(state)
  const failed = getFailedOrders(state)

  return (
    <div>
      <div className="grid-2col">
        <div className="panel">
          <h2>{t('availableOrders')} ({available.length})</h2>
          <div className="scrollable">
            {available.map((order) => (
              <OrderCard key={order.id} order={order} state={state} onDispatch={onDispatch} showAccept />
            ))}
            {available.length === 0 && (
              <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
                {t('noAvailableOrders')}
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>{t('activeOrders')} ({accepted.length + inProgress.length})</h2>
          <div className="scrollable">
            {[...accepted, ...inProgress].map((order) => (
              <OrderCard key={order.id} order={order} state={state} onDispatch={onDispatch} showActions />
            ))}
            {accepted.length === 0 && inProgress.length === 0 && (
              <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
                {t('noActiveOrders')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>{t('completedOrders')} ({delivered.length + failed.length})</h2>
        <div className="grid-2col">
          <div>
            <h3 style={{ color: 'var(--green)' }}>{t('delivered')} ({delivered.length})</h3>
            <div className="scrollable" style={{ maxHeight: 200 }}>
              {delivered.slice(-5).map((order) => (
                <OrderCard key={order.id} order={order} state={state} onDispatch={onDispatch} />
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ color: 'var(--red)' }}>{t('failed')} ({failed.length})</h3>
            <div className="scrollable" style={{ maxHeight: 200 }}>
              {failed.slice(-5).map((order) => (
                <OrderCard key={order.id} order={order} state={state} onDispatch={onDispatch} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { TranslationKey } from '../i18n/translations'
const STATUS_T: Record<string, TranslationKey> = {
  available: 'availableStatus', accepted: 'acceptedStatus',
  in_progress: 'inProgressStatus', delivered: 'deliveredStatus', failed: 'failedStatus',
}

function OrderCard({ order, state, onDispatch, showAccept, showActions }: {
  order: Order; state: GameState; onDispatch: (a: PlayerAction) => void
  showAccept?: boolean; showActions?: boolean
}) {
  const { t } = useLang()
  const ticksLeft = order.deadlineTick - state.tick
  const urgent = ticksLeft <= 3 && order.status !== 'delivered' && order.status !== 'failed'
  const late = ticksLeft < 0 && order.status !== 'delivered' && order.status !== 'failed'

  return (
    <div className="card" style={urgent ? { borderColor: 'var(--orange)' } : late ? { borderColor: 'var(--red)' } : undefined}>
      <div className="card-header">
        <div>
          <span className={`badge badge-${order.domain}`}>{order.domain}</span>{' '}
          <span className="card-title">{order.title}</span>
        </div>
        <span className={`badge ${order.status === 'available' ? 'badge-low' : order.status === 'delivered' ? 'badge-pass' : order.status === 'failed' ? 'badge-fail' : 'badge-medium'}`}>
          {t(STATUS_T[order.status] || order.status)}
        </span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <span style={{ color: 'var(--accent)' }}>${order.reward}</span>
          <span style={{ color: 'var(--text-dim)' }}>
            {t('complexity')}:{order.complexity} {t('ambiguity')}:{order.ambiguity} {t('risk')}:{order.risk}
          </span>
          <span style={{ color: late ? 'var(--red)' : urgent ? 'var(--orange)' : 'var(--text-dim)' }}>
            {late ? `${t('overdue')} ${Math.abs(ticksLeft)}t` : `${ticksLeft}t ${t('left')}`}
          </span>
        </div>
        {order.acceptanceCriteria.length > 0 && (
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            {t('criteria')}: {order.acceptanceCriteria.slice(0, 2).join(', ')}
            {order.acceptanceCriteria.length > 2 && '...'}
          </div>
        )}
      </div>
      {(showAccept || showActions) && (
        <div className="card-actions">
          {showAccept && (
            <button className="primary small" onClick={() => onDispatch({ type: 'ACCEPT_ORDER', orderId: order.id, tick: state.tick })}>
              {t('accept')}
            </button>
          )}
          {showActions && order.status === 'accepted' && (<>
            <button className="small" onClick={() => onDispatch({ type: 'START_PARALLEL_ROUTES', orderId: order.id, routeCount: 2, tick: state.tick })}>
              2 {t('routes')}
            </button>
            <button className="small" onClick={() => onDispatch({ type: 'START_PARALLEL_ROUTES', orderId: order.id, routeCount: 3, tick: state.tick })}>
              3 {t('routes')}
            </button>
          </>)}
          {showActions && order.status === 'in_progress' && (
            <button className="small" onClick={() => onDispatch({ type: 'DELIVER_ORDER', orderId: order.id, tick: state.tick })}>
              {t('deliverNow')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
