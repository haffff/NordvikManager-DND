import React from 'react'
import './App.css'
import { useGlobalProperty } from '../hooks/useGlobalProperty'
import { MonsterHeader }  from './components/MonsterHeader'
import { AttributesPanel } from './components/AttributesPanel'
import { CombatStats }     from './components/CombatStats'
import { DefensesPanel }   from './components/DefensesPanel'
import { TraitsPanel }     from './components/TraitsPanel'
import { ActionsPanel }    from './components/ActionsPanel'

function App({ Api }) {
  const [configRaw] = useGlobalProperty([Api, 'config', null, Api.ClientMediator.sendCommand("Game","GetGameId")])

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
