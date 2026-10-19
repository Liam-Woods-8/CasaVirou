import { useId, useRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Camera, ChevronDown, Loader2, X } from 'lucide-react';
import type { Option } from '../../data/options';
import { fileToCompressedDataUrl } from '../../utils/image';

const inputClass =
  'w-full h-12 border border-line bg-paper px-3 text-base sm:text-sm text-ink placeholder:text-muted/70 transition-colors hover:border-ink/50 focus:border-ink focus:outline-none aria-[invalid=true]:border-red-800';

function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow flex justify-between text-ink">
        <span>{label}</span>
        {optional && <span className="text-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export function TextField({ label, error, hint, optional, className = '', ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
  optional?: boolean;
}

export function TextArea({ label, error, optional, ...rest }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} optional={optional}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={!!error}
        className={`${inputClass} h-auto py-3 leading-relaxed`}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  optional?: boolean;
}

export function SelectField({ label, value, onChange, options, placeholder = 'Select…', error, optional }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} optional={optional}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`${inputClass} appearance-none pr-10`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      </div>
    </FieldShell>
  );
}

interface PhotoFieldProps {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  optional?: boolean;
  aspect?: string;
}

export function PhotoField({ label, value, onChange, optional, aspect = 'aspect-[4/3]' }: PhotoFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(undefined);
    try {
      onChange(await fileToCompressedDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That photo could not be added.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <FieldShell id={id} label={label} error={error} optional={optional}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className={`relative ${aspect} overflow-hidden border border-line bg-paper-deep`}>
          <img src={value} alt="Selected photo" className="h-full w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="eyebrow h-9 border border-ink bg-paper px-3 transition-all hover:bg-ink hover:text-paper"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              aria-label="Remove photo"
              className="flex h-9 w-9 items-center justify-center border border-ink bg-paper transition-all hover:bg-ink hover:text-paper"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`${aspect} flex w-full flex-col items-center justify-center gap-3 border border-dashed border-ink/35 art-dots transition-all hover:border-ink`}
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" strokeWidth={1.5} />}
          <span className="eyebrow">{busy ? 'Processing photo…' : 'Add photo'}</span>
        </button>
      )}
    </FieldShell>
  );
}
