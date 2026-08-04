import React, { useState, useEffect } from 'react'
import './App.css'
import { useGlobalProperty } from '../hooks/useGlobalProperty'
import { MonsterHeader }  from './components/MonsterHeader'
import { AttributesPanel } from './components/AttributesPanel'
import { CombatStats }     from './components/CombatStats'
import { DefensesPanel }   from './components/DefensesPanel'
import { TraitsPanel }     from './components/TraitsPanel'
import { ActionsPanel }    from './components/ActionsPanel'

function App({ Api }) {
  const [gameId, setGameId] = useState(null)

  useEffect(() => {
    const fetchGameId = async () => {
      const id = await Api.ClientMediator.sendCommandAsync('Game', 'GetGameId')
      setGameId(id ?? 'fallback')
    }
    fetchGameId()
  }, [Api])

  if (!gameId) return <div className="monster_loading">Loading…</div>
  return <AppInner Api={Api} gameId={gameId} />
}

function AppInner({ Api, gameId }) {
  const [configRaw] = useGlobalProperty([Api, 'dnd5e_config', null, gameId])

  let config = null
  if (configRaw) {
    try {
      config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw
    } catch { /* use null fallback */ }
  }

  return (
    <div className="dnd5e_card monster_card">
      <MonsterHeader Api={Api} />
      <AttributesPanel Api={Api} config={config} />
      <div className="monster_mid_row">
        <CombatStats Api={Api} />
        <DefensesPanel Api={Api} />
      </div>
      <TraitsPanel Api={Api} />
      <ActionsPanel Api={Api} />
    </div>
  )
}

export default App
