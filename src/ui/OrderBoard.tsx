import React from 'react'
import type { GameState, Order, PlayerAction } from '../sim/types'
import {
  getAvailableOrders,
  getAcceptedOrders,
  getInProgressOrders,
  getDeliveredOrders,
  getFailedOrders,
} from '../game/selectors'

interface Props {
  state: GameState
  onDispatch: (action: PlayerAction) => void
}

export default function OrderBoard({ state, onDispatch }: Props) {
  const available = getAvailableOrders(state)
  const accepted = getAcceptedOrders(state)
  const inProgress = getInProgressOrders(state)
  const delivered = getDeliveredOrders(state)
  const failed = getFailedOrders(state)

  return (
    <div>
      <div className="grid-2col">
        {/* Available Orders */}
        <div className="panel">
          <h2>Available Orders ({available.length})</h2>
          <div className="scrollable">
            {available.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                state={state}
                onDispatch={onDispatch}
                showAccept
              />
            ))}
            {available.length === 0 && (
              <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
                No available orders. Wait for new ones to arrive.
              </div>
            )}
          </div>
        </div>

        {/* Active Orders */}
        <div className="panel">
          <h2>Active Orders ({accepted.length + inProgress.length})</h2>
          <div className="scrollable">
            {[...accepted, ...inProgress].map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                state={state}
                onDispatch={onDispatch}
                showActions
              />
            ))}
            {accepted.length === 0 && inProgress.length === 0 && (
              <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>
                No active orders. Accept an order to begin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completed Orders */}
      <div className="panel">
        <h2>
          Completed Orders ({delivered.length + failed.length})
        </h2>
        <div className="grid-2col">
          <div>
            <h3 style={{ color: 'var(--green)' }}>
              Delivered ({delivered.length})
            </h3>
            <div className="scrollable" style={{ maxHeight: 200 }}>
              {delivered.slice(-5).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  state={state}
                  onDispatch={onDispatch}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ color: 'var(--red)' }}>Failed ({failed.length})</h3>
            <div className="scrollable" style={{ maxHeight: 200 }}>
              {failed.slice(-5).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  state={state}
                  onDispatch={onDispatch}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  state,
  onDispatch,
  showAccept,
  showActions,
}: {
  order: Order
  state: GameState
  onDispatch: (action: PlayerAction) => void
  showAccept?: boolean
  showActions?: boolean
}) {
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
        <span
          className={`badge ${
            order.status === 'available'
              ? 'badge-low'
              : order.status === 'delivered'
              ? 'badge-pass'
              : order.status === 'failed'
              ? 'badge-fail'
              : 'badge-medium'
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <span style={{ color: 'var(--accent)' }}>${order.reward}</span>
          <span style={{ color: 'var(--text-dim)' }}>
            C:{order.complexity} A:{order.ambiguity} R:{order.risk}
          </span>
          <span style={{ color: late ? 'var(--red)' : urgent ? 'var(--orange)' : 'var(--text-dim)' }}>
            {late
              ? `Overdue by ${Math.abs(ticksLeft)}t`
              : `${ticksLeft}t left`}
          </span>
        </div>

        {order.acceptanceCriteria.length > 0 && (
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            Criteria: {order.acceptanceCriteria.slice(0, 2).join(', ')}
            {order.acceptanceCriteria.length > 2 && '...'}
          </div>
        )}
      </div>

      {(showAccept || showActions) && (
        <div className="card-actions">
          {showAccept && (
            <button
              className="primary small"
              onClick={() =>
                onDispatch({
                  type: 'ACCEPT_ORDER',
                  orderId: order.id,
                  tick: state.tick,
                })
              }
            >
              Accept
            </button>
          )}
          {showActions && order.status === 'accepted' && (
            <>
              <button
                className="small"
                onClick={() =>
                  onDispatch({
                    type: 'START_PARALLEL_ROUTES',
                    orderId: order.id,
                    routeCount: 2,
                    tick: state.tick,
                  })
                }
              >
                2 Routes
              </button>
              <button
                className="small"
                onClick={() =>
                  onDispatch({
                    type: 'START_PARALLEL_ROUTES',
                    orderId: order.id,
                    routeCount: 3,
                    tick: state.tick,
                  })
                }
              >
                3 Routes
              </button>
            </>
          )}
          {showActions && order.status === 'in_progress' && (
            <button
              className="small"
              onClick={() =>
                onDispatch({
                  type: 'DELIVER_ORDER',
                  orderId: order.id,
                  tick: state.tick,
                })
              }
            >
              Deliver Now
            </button>
          )}
        </div>
      )}
    </div>
  )
}
