"use client";

import { useId, useState, type InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string; label: string; errors?: string[]; hint?: string;
};

export function FormField({ name, label, errors = [], hint, type = "text", id, ...props }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = [hint ? `${fieldId}-hint` : "", errors.length ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="form-field">
      <label htmlFor={fieldId}>{label}</label>
      <div className={`form-input-wrap${type === "password" ? " has-toggle" : ""}`}>
        <input {...props} id={fieldId} name={name} type={type === "password" && visible ? "text" : type} aria-invalid={errors.length ? true : undefined} aria-describedby={describedBy} />
        {type === "password" && <button className="password-toggle" type="button" aria-label={`${label} ${visible ? "нуух" : "харуулах"}`} aria-pressed={visible} disabled={props.disabled} onClick={() => setVisible(!visible)}>{visible ? "Нуух" : "Харах"}</button>}
      </div>
      {hint && <p className="form-hint" id={`${fieldId}-hint`}>{hint}</p>}
      {errors.length > 0 && <p className="form-field-error" id={`${fieldId}-error`}>{errors[0]}</p>}
    </div>
  );
}
