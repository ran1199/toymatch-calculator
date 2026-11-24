// Collapsible explanation of the formulas and assumptions (closed by default).

import { copy } from "../copy";

export function HowCalculated() {
  const { summary, formulas, assumptionsHeading, assumptions } = copy.howCalculated;
  return (
    <details className="disclosure how">
      <summary className="disclosure__summary">{summary}</summary>
      <div className="disclosure__body">
        <dl className="formulas">
          {formulas.map((item) => (
            <div className="formulas__row" key={item.name}>
              <dt>{item.name}</dt>
              <dd>= {item.formula}</dd>
            </div>
          ))}
        </dl>
        <h3 className="how__subheading">{assumptionsHeading}</h3>
        <ul className="how__list">
          {assumptions.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
