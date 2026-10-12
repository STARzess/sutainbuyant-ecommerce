"use client";

import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type FieldProps = { name: string; label: string; errors?: string[]; hint?: string };

function FieldFrame({ id, label, errors, hint, children }: {
  id: string; label: string; errors: string[]; hint?: string; children: React.ReactNode;
}) {
  return <div className="form-field">
    <label htmlFor={id}>{label}</label>
    {children}
    {hint && <p className="form-hint" id={`${id}-hint`}>{hint}</p>}
    {errors.length > 0 && <p className="form-field-error" id={`${id}-error`}>{errors[0]}</p>}
  </div>;
}

function useFieldDescription(id: string | undefined, hint: string | undefined, errors: string[]) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = [hint ? `${fieldId}-hint` : "", errors.length ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined;
  return { fieldId, describedBy };
}

export function FormField({ name, label, errors = [], hint, type = "text", id, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  const [visible, setVisible] = useState(false);
  const { fieldId, describedBy } = useFieldDescription(id, hint, errors);
  return <FieldFrame id={fieldId} label={label} errors={errors} hint={hint}>
    <div className={`form-input-wrap${type === "password" ? " has-toggle" : ""}`}>
      <input {...props} id={fieldId} name={name} type={type === "password" && visible ? "text" : type} aria-invalid={errors.length ? true : undefined} aria-describedby={describedBy} />
      {type === "password" && <button className="password-toggle" type="button" aria-label={`${label} ${visible ? "нуух" : "харуулах"}`} aria-pressed={visible} disabled={props.disabled} onClick={() => setVisible(!visible)}>{visible ? "Нуух" : "Харах"}</button>}
    </div>
  </FieldFrame>;
}

export function FormTextArea({ name, label, errors = [], hint, id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const { fieldId, describedBy } = useFieldDescription(id, hint, errors);
  return <FieldFrame id={fieldId} label={label} errors={errors} hint={hint}>
    <textarea {...props} id={fieldId} name={name} aria-invalid={errors.length ? true : undefined} aria-describedby={describedBy} />
  </FieldFrame>;
}
