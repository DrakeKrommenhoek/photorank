// src/components/CriteriaSelector.tsx
'use client';
import type { SelectedCriteria } from '@/lib/types';

interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  badge?: string;
}

function CheckboxItem({ id, label, checked, onChange, badge }: CheckboxItemProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${
        checked
          ? 'bg-[#6366f1]/15 border-[#6366f1]/50 text-white'
          : 'bg-[#1a1a1a] border-[#2a2a2a] text-zinc-300 hover:border-[#3a3a3a]'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
          checked ? 'bg-[#6366f1] border-[#6366f1]' : 'border-zinc-600'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium flex-1">{label}</span>
      {badge && (
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </label>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface Props {
  criteria: SelectedCriteria;
  onChange: (partial: Partial<SelectedCriteria>) => void;
}

export function CriteriaSelector({ criteria, onChange }: Props) {
  return (
    <div className="space-y-8">
      <Group title="People">
        <CheckboxItem
          id="eyesOpen"
          label="My eyes are open"
          checked={criteria.eyesOpen}
          onChange={(v) => onChange({ eyesOpen: v })}
          badge="face detection"
        />
        <CheckboxItem
          id="allEyesOpen"
          label="Everyone's eyes are open"
          checked={criteria.allEyesOpen}
          onChange={(v) => onChange({ allEyesOpen: v })}
          badge="face detection"
        />
        <CheckboxItem
          id="bestSmiles"
          label="Best smiles"
          checked={criteria.bestSmiles}
          onChange={(v) => onChange({ bestSmiles: v })}
          badge="face detection"
        />
        <div className="space-y-2">
          <CheckboxItem
            id="specificPeople"
            label="Specific people included"
            checked={criteria.specificPeople}
            onChange={(v) => onChange({ specificPeople: v })}
            badge="coming soon"
          />
          {criteria.specificPeople && (
            <input
              type="text"
              placeholder="e.g. Drake, Greg, Goose"
              value={criteria.specificPeopleNames}
              onChange={(e) => onChange({ specificPeopleNames: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          )}
        </div>
      </Group>

      <Group title="Technical Quality">
        <CheckboxItem
          id="bestLighting"
          label="Best lighting / exposure"
          checked={criteria.bestLighting}
          onChange={(v) => onChange({ bestLighting: v })}
        />
        <CheckboxItem
          id="leastBlurry"
          label="Least blurry / sharpest"
          checked={criteria.leastBlurry}
          onChange={(v) => onChange({ leastBlurry: v })}
        />
        <CheckboxItem
          id="bestComposition"
          label="Best composition"
          checked={criteria.bestComposition}
          onChange={(v) => onChange({ bestComposition: v })}
          badge="coming soon"
        />
      </Group>

      <Group title="Vibe">
        <CheckboxItem
          id="bestGroup"
          label="Best group photo"
          checked={criteria.bestGroup}
          onChange={(v) => onChange({ bestGroup: v })}
        />
        <CheckboxItem
          id="bestSolo"
          label="Best solo shot"
          checked={criteria.bestSolo}
          onChange={(v) => onChange({ bestSolo: v })}
        />
        <CheckboxItem
          id="bestCandid"
          label="Best candid"
          checked={criteria.bestCandid}
          onChange={(v) => onChange({ bestCandid: v })}
        />
        <CheckboxItem
          id="instagram"
          label="Instagram-worthy"
          checked={criteria.instagram}
          onChange={(v) => onChange({ instagram: v })}
        />
      </Group>
    </div>
  );
}
