import React from 'react';
import { JournalTemplate, JournalTemplateField } from '../../../types';

interface PsychologyJournalFormProps {
  template: JournalTemplate;
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  disabled: boolean;
}

export const PsychologyJournalForm: React.FC<PsychologyJournalFormProps> = ({ template, data, onChange, disabled }) => {
  return (
    <div className="space-y-4">
      {template.fields.sort((a, b) => a.order - b.order).map((field: JournalTemplateField) => (
        <div key={field.key} className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            {field.label} {field.required && <span className="text-rose-500">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={(data[field.key] as string) || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={disabled}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              rows={3}
            />
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={(data[field.key] as string | number) || ''}
              onChange={(e) => onChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              disabled={disabled}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          )}
        </div>
      ))}
    </div>
  );
};
