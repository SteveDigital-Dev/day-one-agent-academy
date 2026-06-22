import { useEffect, useState } from "react";
import { api, type Subject, type Concept, type Lesson } from "../api/client";

interface Props {
  preselectedConceptId?: string;
  onCreated: (lesson: Lesson) => void;
  onCancel?: () => void;
}

const CONTENT_TYPES = ["text", "video", "quiz", "exercise", "reading"];

export function AddLessonForm({ preselectedConceptId, onCreated, onCancel }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [conceptId, setConceptId] = useState(preselectedConceptId ?? "");
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("text");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Subject[]>("/curriculum/subjects").then(setSubjects);
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;
    api.get<Concept[]>(`/curriculum/subjects/${selectedSubjectId}/concepts`).then(setConcepts);
  }, [selectedSubjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptId) { setError("Select a concept first"); return; }
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError("");
    try {
      const lesson = await api.post<Lesson>("/curriculum/lessons", {
        concept_id: conceptId,
        title: title.trim(),
        content_type: contentType,
        estimated_minutes: estimatedMinutes,
        content: content || null,
        order_index: 0,
      });
      onCreated(lesson);
      setTitle("");
      setContent("");
      setEstimatedMinutes(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create lesson");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-academy-500 focus:outline-none focus:ring-1 focus:ring-academy-500";
  const labelCls = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!preselectedConceptId && (
        <>
          <div>
            <label className={labelCls}>Subject</label>
            <select
              className={inputCls}
              value={selectedSubjectId}
              onChange={(e) => { setSelectedSubjectId(e.target.value); setConceptId(""); }}
            >
              <option value="">Select a subject…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Concept</label>
            <select
              className={inputCls}
              value={conceptId}
              onChange={(e) => setConceptId(e.target.value)}
              disabled={!selectedSubjectId}
            >
              <option value="">Select a concept…</option>
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className={labelCls}>Lesson Title</label>
        <input
          type="text"
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Introduction to Fractions"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Content Type</label>
          <select className={inputCls} value={contentType} onChange={(e) => setContentType(e.target.value)}>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Est. Minutes</label>
          <input
            type="number"
            className={inputCls}
            value={estimatedMinutes}
            min={5}
            max={240}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Content / Notes <span className="text-gray-400">(optional)</span></label>
        <textarea
          className={inputCls}
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Lesson description, materials, or notes…"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-academy-600 px-4 py-2 text-sm font-medium text-white hover:bg-academy-700 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create Lesson"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
