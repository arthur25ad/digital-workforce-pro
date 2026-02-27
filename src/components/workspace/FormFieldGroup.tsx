import { ReactNode } from "react";

interface FieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

interface FormFieldGroupProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  fields: FieldConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const FormFieldGroup = ({ title, description, icon, fields, values, onChange }: FormFieldGroupProps) => (
  <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
    <div className="flex items-center gap-3">
      {icon && <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>}
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(f => (
        <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              rows={2}
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none transition-colors"
            />
          ) : f.type === "select" ? (
            <select
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            >
              {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

export default FormFieldGroup;
