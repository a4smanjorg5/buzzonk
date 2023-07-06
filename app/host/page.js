'use client'

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { useEffect, useState } from 'react'
import ActionMessage from '@/components/action-message';
import Checkbox from '@/components/checkbox';
import SecondaryButton from '@/components/secondary-button'

const peer = new (require('peerjs').Peer)(sessionStorage.getItem('cid'), {
  debug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 2 : 0,
}), peers = {}, dashboard = {}

const connData = (type, p) => {
  const result = connData.default[type]
  result.payload = p
  return result
}
connData.default = {
  'PAUSE': { type: 'PAUSE' },
  'RESUME': { type: 'RESUME' },
  'TEAM': { type: 'TEAM' },
  'TIMEOUT': { type: 'TIMEOUT' },
}

let primeInt = 2, buzzState = [], beforeBuzz = 0, lockState = !0,
expState = false, lcA = 0, lcB = null

peer.on('disconnected', () => setTimeout(() => {
  if (peer.disconnected) peer.reconnect()
}, nextPrime() * 400))
peer.on('open', () => {
  if (primeInt <= 2) return
  console.clear()
  primeInt = 2
})

export default function Host() {
  const [cids, setCid] = useState([]),
  [hID, setHID] = useState(sessionStorage.getItem('cid') || ''),

  [cbt, setCBT] = useState(+sessionStorage.getItem('cbt') || 5),
  [lto, setLTO] = useState(+sessionStorage.getItem('lto') || 10),

  [mtSuccess, setMTS] = useState(false),
  [buzz, setBuzz] = useState(buzzState),
  [unlocked, setUnlock] = useState(lockState),
  [expired, setExp] = useState(expState)

  useEffect(() => {
    const connOpen = conn => {
      if (expState) return conn.close()
      conn.once('close', () => {
        if (conn.peer in peers) {
          delete peers[conn.peer]
          updCid()
        }
      })
      conn.on('data', ({ type: evType, payload }) => {
        switch (evType) {
        case 'BUZZ':
          if (!(conn.peer in peers))
            break
          if (buzzState.includes(conn) || !lockState)
            return conn.send(connData('PAUSE'))
          setBuzz([...buzzState, conn])
          break
        case 'NAME':
          const cn = '' + payload
          if (cn) {
            conn.name = cn
            conn.send(connData(lockState ? 'RESUME' : 'PAUSE'))
            peers[conn.peer] = conn
            updCid()
          } else {
            dashboard[conn.peer] = conn
          }
          break
        case 'TEAM':
          peers[conn.peer].team = Math.floor(payload)
          updCid()
          break;
        }
      })
      conn.name = conn.peer
      conn.team = 0
      conn.timeout = 0
    }

    peer.on('connection', connOpen)
    peer.once('open', () => {
      if (hID != peer.id) {
        sessionStorage.setItem('cid', peer.id)
        setHID(peer.id)
      }
    })
    return () => {
      peer.off('connection', connOpen)
    }
  }, [])

  const unlockChange = () => {
    if (!unlocked || typeof unlocked != 'number') {
      clearInterval(beforeBuzz)
      Object.keys(peers).forEach(cid => {
        const b = peers[cid]
        if (!buzz.includes(b))
          b.send(connData(unlocked ? 'RESUME' : 'PAUSE'))
      })
    }
  }

  useEffect(unlockChange, [unlocked])

  useEffect(() => {
    sessionStorage.setItem('cbt', cbt)
    sessionStorage.setItem('lto', lto)
  }, [lto, cbt])

  const callBuzz = e => {
    if (lcB) {
      clearInterval(lcA)
      lcB.send(connData('TIMEOUT', lcB.timeout = 0))
    }
    lcB = peers[e.target.dataset.cid]
    lcB.send(connData('TIMEOUT', cbt))
    lcB.timeout = cbt
    lcA = setInterval(nativeSec, 1000)
    updCid()
  }

  const updCid = () => setCid(Object.keys(peers))

  const nativeSec = () => {
    lcB.timeout--
    if (lcB.timeout <= 0) {
      clearInterval(lcA)
      lcB = null
    }
    updCid()
  }

  const countdown = () => {
    if (lockState > 0)
      setUnlock(lockState - 1)
  }

  const resetGame = () => {
    setUnlock(lto)
    unlockChange()
    clearInterval(beforeBuzz)
    beforeBuzz = setInterval(countdown, 1000)
    setBuzz([])
    cids.forEach(cid => peers[cid].send(connData('RESUME')))
  }

  const settChange = ({ target }) => {
    switch (target.name) {
    case 'cbt':
      setCBT(Math.max(target.value, 1))
      break
    case 'lto':
      setLTO(Math.max(target.value, 1))
      break
    }
  }

  buzzState = buzz
  expState = expired
  lockState = unlocked
  if (peer.disconnected) peer.reconnect()
  const hostURL = new URL('/' + hID, location)

  return (
    <main className="flex min-h-screen flex-col gap-4 items-center p-24">
      <div className="flex gap-4">
        <SecondaryButton handleClick={() => setUnlock(!unlocked)}>
          {unlocked ? 'Pause' + (typeof unlocked == 'number' ? ` (${unlocked})` : '') : 'Resume'}
        </SecondaryButton>
        <SecondaryButton handleClick={resetGame}>Reset</SecondaryButton>
      </div>
      <div>
        {hID ? <label className="block">
          Host URL: <input
            type="text"
            value={hostURL}
            size={hostURL.length}
            onClick={({target}) => {
              // navigator.share({ url: target.value })
              target.select()
              document.execCommand('copy')
            }}
            readOnly
          />
        </label> : <div className="add-loading">please wait, generating host url</div>}
        <label className="flex items-center">
          <Checkbox value={!expired} handleChange={e => setExp(!e.target.checked)} />

          <span className="ml-2 text-sm text-gray-600">Allow enter new connection</span>
        </label>
      </div>
      {(buzz.length || '') && <div>
        <div>peers buzzed</div>
        <ol className="pl-12">
          {buzz.map(b => <li key={b.peer} className="list-decimal">{b.name}</li>)}
        </ol>
      </div>}
      {(cids.length || '') && <div className="border-separate border-spacing-x-2 table table-auto">
        <div className="table-header-group">
          <div className="table-row">
            <div className="table-cell">Player</div>
            <div className="table-cell">action</div>
          </div>
        </div>
        <div className="table-row-group">
          {cids.map(cid => {
            const b = peers[cid]
            return <div key={cid} className="table-row">
              <div className="table-cell">{b.name}</div>
              <div className="table-cell">
                {b.timeout || <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                  data-cid={cid}
                  onClick={callBuzz}
                >
                  call
                </button>}
              </div>
            </div>
          })}
        </div>
        </div>}
        <div className="grid auto-cols-max gap-4">
          <div className="col-span-3">settings</div>

          <div>After buzz</div>
          <div>:</div>
          <div><input type="number" name="cbt" min="1" value={cbt} onChange={settChange} /></div>

          <div>Before buzz</div>
          <div>:</div>
          <div><input type="number" name="lto" min="1" value={lto} onChange={settChange} /></div>
        </div>
    </main>
  )
}

const isPrime = num => {
  for(let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if(num % i === 0) return false
  }
  return num > 1
}

const nextPrime = () => {
  const last = primeInt
  do {
    primeInt++
  } while (!isPrime(primeInt))
  return last
}
