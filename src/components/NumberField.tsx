// One labelled input with its unit, supporting text, optional note and error.
// Uses a text input (not type="number") so people can clear and retype freely.

interface NumberFieldProps {
  id: string;
  label: string;
  help: string;
  note?: string;
  unitBefore?: string;
  unitAfter?: string;
  inputMode: "numeric" | "decimal";
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function NumberField({
  id,
  label,
  help,
  note,
  unitBefore,
  unitAfter,
  inputMode,
  value,
  error,
  onChange,
}: NumberFieldProps) {
  const helpId = `${id}-help`;
  const noteId = `${id}-note`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, helpId, note ? noteId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`field${error ? " field--error" : ""}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <p className="field__help" id={helpId}>
        {help}
      </p>
      <div className="field__control">
        {unitBefore && (
          <span className="field__unit field__unit--before" aria-hidden="true">
            {unitBefore}
          </span>
        )}
        <input
          id={id}
          name={id}
          className="field__input"
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          spellCheck={false}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
        {unitAfter && <span className="field__unit">{unitAfter}</span>}
      </div>
      {error && (
        <p className="field__error" id={errorId}>
          <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M10 5.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="10" cy="14.2" r="1.1" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
      {note && (
        <p className="field__note" id={noteId}>
          {note}
        </p>
      )}
    </div>
  );
}
