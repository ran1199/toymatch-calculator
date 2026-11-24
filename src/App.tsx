// The whole page: introduction, inputs (left on desktop), results (right).
// State is the raw text of each field, kept in React only: nothing is saved
// to the browser, and results recalculate on every keystroke.

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { copy } from "./copy";
import { NumberField } from "./components/NumberField";
import { ResultsPanel } from "./components/ResultsPanel";
import { HowCalculated } from "./components/HowCalculated";
import {
  defaultRawValues,
  fieldRules,
  getResultsView,
  type FieldId,
  type RawValues,
} from "./lib/validate";

export function App() {
  const [raw, setRaw] = useState<RawValues>(defaultRawValues);
  const adjustRef = useRef<HTMLDetailsElement>(null);

  const view = useMemo(() => getResultsView(raw), [raw]);
  const errors = view.errors;

  // A problem inside "Adjust costs" opens that section (and keeps it open
  // until fixed), so the highlighted field is never hidden. Otherwise the
  // <details> element opens and closes itself as normal.
  const adjustHasError = (Object.keys(errors) as FieldId[]).some(
    (id) => fieldRules[id].inAdjustCosts,
  );

  useLayoutEffect(() => {
    if (adjustHasError && adjustRef.current && !adjustRef.current.open) {
      adjustRef.current.open = true;
    }
  });

  const update = (id: FieldId) => (value: string) =>
    setRaw((previous) => ({ ...previous, [id]: value }));

  const reset = () => {
    setRaw(defaultRawValues);
    if (adjustRef.current) adjustRef.current.open = false; // back to collapsed
  };

  // Shared props for each field, by id.
  const fieldProps = (id: FieldId) => {
    const text = copy.fields[id];
    return {
      id,
      label: text.label,
      help: text.help,
      note: "note" in text ? text.note : undefined,
      unitBefore: "unitBefore" in text ? text.unitBefore : undefined,
      unitAfter: "unitAfter" in text ? text.unitAfter : undefined,
      inputMode: fieldRules[id].kind === "whole" ? ("numeric" as const) : ("decimal" as const),
      value: raw[id],
      error: errors[id],
      onChange: update(id),
    };
  };

  return (
    <div className="page">
      <header className="masthead">
        <p className="masthead__name">{copy.appName}</p>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">{copy.title}</h1>
          <p className="intro__description">{copy.description}</p>
          <p className="intro__notice">{copy.assumptionNotice}</p>
        </section>

        <div className="layout">
          <form
            className="inputs"
            aria-labelledby="inputs-heading"
            noValidate
            onSubmit={(event) => event.preventDefault()}
          >
            <h2 id="inputs-heading" className="section-heading">
              {copy.inputsHeading}
            </h2>

            <NumberField {...fieldProps("giftOccasions")} />
            <NumberField {...fieldProps("usualMinutes")} />
            <NumberField {...fieldProps("toyMatchMinutes")} />
            <NumberField {...fieldProps("hourlyValue")} />

            <details
              ref={adjustRef}
              className="disclosure adjust"
              data-testid="adjust-costs"
              onToggle={(event) => {
                // Re-open straight away if someone tries to collapse it while it holds an error
                if (adjustHasError && !event.currentTarget.open) event.currentTarget.open = true;
              }}
            >
              <summary className="disclosure__summary">{copy.adjustCosts}</summary>
              <div className="disclosure__body">
                <NumberField {...fieldProps("additionalAnnualMinutes")} />
                <NumberField {...fieldProps("subscriptionCost")} />
              </div>
            </details>

            <button type="button" className="button" onClick={reset}>
              {copy.resetButton}
            </button>
          </form>

          <div className="results-column">
            <ResultsPanel view={view} />
          </div>
        </div>

        <HowCalculated />
      </main>
    </div>
  );
}
