import type { ComponentProps } from "react";

type FormFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  name: string;
  error?: string;
};

export function FormField({ label, name, error, ...inputProps }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink-2">
        {label}
      </label>
      <input
        {...inputProps}
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field"
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div role="alert" className="alert-danger py-3">
      {message}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean;
  children: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary h-auto w-full px-5 py-3 text-sm"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
