'use client'

/**
 * This file is part of the buzzonk app.
 *
 * (c) a4smanjorg5
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ActionMessage from '@/components/action-message';
import Button from '@/components/button';
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorPage from 'next/error'

const connData = (type, p) => {
  const result = connData.default[type]
  result.payload = p
  return result
}, isBrowser = typeof window != 'undefined'
connData.default = {
  'BUZZ': { type: 'BUZZ' },
  'NAME': { type: 'NAME' },
  'TEAM': { type: 'TEAM' },
}

const peerDisconnect = () => peer.reconnect()
let peer, tconn = 0, ivc = 0

export default function Page({ params: { cid } }) {
  const router = useRouter()
  const [host, setHost] = useState(false),
  [status, setStatus] = useState([
    'please wait, currently checking the requested host',
    'connecting to server (1/2)'
  ]), [dn, setDN] = useState(isBrowser && sessionStorage.getItem('dn')),
  [flashDN, setFlashDN] = useState(false),
  [called, setCall] = useState(0),
  [buzz, setBuzz] = useState(0)

  useEffect(() => {
    if (!cid) return
    tconn = setTimeout(() => router.refresh(), 10000)

    const peerError = ({ type: errType }) => {
      if (errType == 'peer-unavailable')
        setTimeout(openConn, 4000)
    }
    import('peerjs').then(({ Peer }) => {
      peer = new Peer({
        debug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 2 : 0,
      })
      peer.on('disconnected', peerDisconnect)
      peer.on('error', peerError)

      peer.once('open', () => {
        clearTimeout(tconn)
        tconn = 0
        setStatus(status.concat(['connecting to peer host (2/2)']))
        openConn()
      })
    })

    return () => {
      if (!cid) return
      peer.off('disconnected', peerDisconnect)
      peer.off('error', peerError)
      peer.host?.close()
      peer.disconnect()
    }
  }, [cid])

  useEffect(() => {
    if (host) {
      host.on('close', openConn)

      if (typeof dn == 'string') {
        flashName()
        sendMsg('NAME', dn)
      }
      if (typeof sessionStorage.getItem('team') == 'string')
        sendMsg('TEAM', sessionStorage.getItem('team'))
      host.on('data', hostOnData)
    }
    return () => {
      if (host) {
        host.off('close', openConn)
        host.off('data', hostOnData)
      }
    }
  }, [host])

  const openConn = () => {
    if (peer.disconnected) return
    setHost(false)
    if (tconn <= 0)
      tconn = setTimeout(() => {
        peer.off('disconnected', peerDisconnect)
        peer.disconnect()
        setHost(null)
      }, 10000)
    const conn = peer.connect(cid)
    conn.on('open', () => {
      clearTimeout(tconn)
      tconn = 0
      setHost(peer.host = conn)
    })
  }

  const hostOnData = ({ type: evType, payload }) => {
    switch (evType) {
    case 'TIMEOUT':
      clearInterval(ivc)
      setCall(payload)
      if (payload && payload > 0)
        ivc = setInterval(() => {
          if (payload <= 0)
            return clearInterval(ivc)
          setCall(--payload)
        }, 1000)
      break;
    case 'PAUSE':
      setBuzz(-1)
      break;
    case 'RESUME':
      setBuzz(0)
      break;
    case 'TEAM':
      sessionStorage.setItem('team', Math.floor(payload.index))
      setTN(payload.name)
      break;
    }
  }

  const submitted = () => {
    if (typeof dn != 'string')
      return
    sessionStorage.setItem('dn', dn)
    flashName()
    if (host) sendMsg('NAME', dn)
  }

  const sendMsg = (type, p) => {
    host.send(connData(type, p))
  }

  const flashName = () => {
    setFlashDN(!0)
    setTimeout(() => setFlashDN(false), 2000)
  }

  const selectDN = ({ target }) => {
    if (target.type != 'radio' || !target.value)
      setDN(target.value)
  }

  const toggleBuzz = () => {
    if (buzz) return
    setBuzz(1)
    sendMsg('BUZZ')
  }

  if (host === null) setTimeout(() => router.refresh(), 2000)

  return (
    host !== null ? <main className={(called ? 'bg-cyan-600 ' : '') + 'flex min-h-screen flex-col items-center p-8 sm:p-24'}>
      {host ? <>
        <ActionMessage on={flashDN}>Selamat datang {dn}</ActionMessage>
        {sessionStorage.getItem('dn') === null && <form onSubmit={e => { e.preventDefault(); submitted() }} onChange={selectDN}>
          <label>
            <input type="text" name="dn" value={dn} required />
          </label>
          <div className="mt-2"><Button>Submit</Button></div>
        </form>}
        {sessionStorage.getItem('dn') && <svg xmlns="http://www.w3.org/2000/svg" role="button" className="max-w-[--buzz-max-w] mt-8 sm:mt-0" onClick={toggleBuzz} viewBox="0 0 200 200">
          <circle fill={buzz > 0 ? 'green' : (buzz < 0 ? 'yellow' : 'red')} stroke="black" strokeWidth="2" cx="100" cy="100" r="98" />
          <text textAnchor="middle" dominantBaseline="middle" x="50%" y="50%">{buzz > 0 ? 'BUZZED' : (buzz < 0 ? 'LOCKED' : 'BUZZ')}</text>
        </svg>}
      </> : <div>
        {status.map((s, i) => <p key={'s'+i} {...(i + 1 >= status.length || i === 0 ? { className: 'add-loading' } : {})}>{s}</p>)}
      </div>}
    </main> : <ErrorPage statusCode="404" />
  )
}
