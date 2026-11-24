// The results column. Wrapped in a polite live region so screen readers
// announce updated numbers as people type.

import { copy } from "../copy";
import type { NetState } from "../lib/calculate";
import type { ResultsView } from "../lib/validate";

function StateIcon({ state }: { state: NetState | "extra" | "info" }) {
  return (
    <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      {state === "positive" && (
        <path d="M6 10.4l2.6 2.6L14 7.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {state === "zero" && (
        <path d="M6.5 8.3h7M6.5 11.7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
      {(state === "negative" || state === "extra") && (
        <>
          <path d="M10 5.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="14.2" r="1.1" fill="currentColor" />
        </>
      )}
      {state === "info" && (
        <>
          <circle cx="10" cy="5.9" r="1.1" fill="currentColor" />
          <path d="M10 9v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function ResultCard({
  label,
  value,
  testId,
  variant,
}: {
  label: string;
  value: string;
  testId: string;
  variant?: "extra" | "primary";
}) {
  return (
    <div className={`card${variant ? ` card--${variant}` : ""}`} data-testid={testId}>
      <p className="card__label" data-testid={`${testId}-label`}>
        {variant === "extra" && <StateIcon state="extra" />}
        {label}
      </p>
      <p className="card__value" data-testid={`${testId}-value`}>
        {value}
      </p>
    </div>
  );
}

export function ResultsPanel({ view }: { view: ResultsView }) {
  return (
    <section className="results" aria-labelledby="results-heading">
      <h2 id="results-heading" className="section-heading">
        {copy.resultsHeading}
      </h2>

      <div aria-live="polite" className="results__live">
        {view.status === "incomplete" ? (
          <p className="notice notice--warning" data-testid="incomplete-message">
            <StateIcon state="negative" />
            {view.message}
          </p>
        ) : (
          <div className="cards">
            <ResultCard
              testId="time"
              label={view.estimate.timeLabel}
              value={view.estimate.timeText}
              variant={view.estimate.isExtraTime ? "extra" : undefined}
            />

            {view.estimate.hasHourlyValue && view.estimate.timeValueText && (
              <ResultCard
                testId="worth"
                label={copy.results.timeValueLabel}
                value={view.estimate.timeValueText}
              />
            )}

            <ResultCard
              testId="subscription"
              label={copy.results.subscriptionLabel}
              value={view.estimate.subscriptionText}
            />

            {view.estimate.hasHourlyValue && view.estimate.netValueText ? (
              <ResultCard
                testId="net"
                label={copy.results.netValueLabel}
                value={view.estimate.netValueText}
                variant="primary"
              />
            ) : (
              <p className="notice notice--info" data-testid="add-hourly-prompt">
                <StateIcon state="info" />
                {copy.results.addHourlyPrompt}
              </p>
            )}

            {view.estimate.message && view.estimate.netState && (
              <p
                className={`notice notice--${view.estimate.netState}`}
                data-testid="net-message"
                data-state={view.estimate.netState}
              >
                <StateIcon state={view.estimate.netState} />
                {view.estimate.message}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="results__disclaimer">{copy.results.disclaimer}</p>
    </section>
  );
}
