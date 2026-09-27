import { useProperty } from "../../hooks/useProperty";

export const DeathSaves = ({ Api }) => {
  const [successes, setSuccesses] = useProperty([Api, "death_save_success", 0]);
  const [failures, setFailures] = useProperty([Api, "death_save_failure", 0]);

  // Clicking the highest checked box unchecks it; any other box sets the count to it.
  const toggleSuccess = (n) => {
    setSuccesses(successes === n ? n - 1 : n);
  };
  const toggleFailure = (n) => {
    setFailures(failures === n ? n - 1 : n);
  };

  return (
    <div className="dnd5e_death_saves_container">
      <div className="dnd-panel-title">Death Saves</div>
      <div className="dnd5e_death_saves">
        <div className="dnd5e_death_saves_success">
          Success
          <input className="dnd5e_death_saves_success_checkbox" type="checkbox" checked={successes > 0} onChange={() => toggleSuccess(1)} />
          <input className="dnd5e_death_saves_success_checkbox" type="checkbox" checked={successes > 1} onChange={() => toggleSuccess(2)} />
          <input className="dnd5e_death_saves_success_checkbox" type="checkbox" checked={successes > 2} onChange={() => toggleSuccess(3)} />
        </div>
        <div className="dnd5e_death_saves_failure">
          Failure
          <input className="dnd5e_death_saves_failure_checkbox" type="checkbox" checked={failures > 0} onChange={() => toggleFailure(1)} />
          <input className="dnd5e_death_saves_failure_checkbox" type="checkbox" checked={failures > 1} onChange={() => toggleFailure(2)} />
          <input className="dnd5e_death_saves_failure_checkbox" type="checkbox" checked={failures > 2} onChange={() => toggleFailure(3)} />
        </div>
        <button
          style={{ marginTop: "6px", alignSelf: "flex-start" }}
          onClick={() => {
            Api.FireAction("dnd5e/roll_death_save", {});
          }}
        >
          Roll Death Save
        </button>
      </div>
    </div>
  );
};
