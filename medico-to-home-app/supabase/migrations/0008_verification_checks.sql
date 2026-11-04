-- Verification checklist: at each step staff tick every check before passing it. Kept per step,
-- with who passed it and when: { "documents": { "checks": [...], "note": "", "by": "...", "at": "..." }, ... }.
-- Safe to run more than once.
alter table public.applications add column if not exists checks jsonb not null default '{}';
