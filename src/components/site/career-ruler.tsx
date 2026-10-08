import { careerLog, type CareerStage } from "@/content/stretch/career";

/**
 * The career log as a vertical ruler, oldest first. Each stage carries its
 * dates, role, organisation, one-line story notes and milestone markers; the
 * current stage is the cobalt one. On phones the dates sit above the role.
 */
export function CareerRuler() {
  // `careerLog` is `as const`; widen to the declared type so optional fields read cleanly.
  const stages: readonly CareerStage[] = careerLog.stages;
  return (
    <ol className="stretch-ruler">
      {stages.map((stage) => (
        <li key={stage.dates} className="stretch-stage" data-current={stage.isCurrent ? "true" : undefined}>
          <p className="stretch-mono stretch-stage__dates">{stage.dates}</p>
          <div className="stretch-stage__body">
            <h3 className="stretch-stage__role">{stage.role}</h3>
            {stage.organisation && <p className="stretch-stage__org">{stage.organisation}</p>}
            {stage.notes.length > 0 && (
              <ul className="stretch-stage__notes">
                {stage.notes.map((note) => (
                  <li key={note.text}>
                    {note.text}
                    {note.when && <span className="stretch-mono stretch-stage__when"> {note.when}</span>}
                  </li>
                ))}
              </ul>
            )}
            {stage.milestones.length > 0 && (
              <ul className="stretch-stage__milestones">
                {stage.milestones.map((milestone) => (
                  <li key={milestone.text} className="stretch-milestone">
                    <span className="stretch-milestone__mark" aria-hidden="true" />
                    <span>
                      {milestone.text}
                      <span className="stretch-mono stretch-stage__when"> {milestone.when}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
