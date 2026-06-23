import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Subject, type Concept, type Lesson } from "../../api/client";
import { useGame } from "../../context/GameContext";
import { SkillTree } from "../../components/gamification/SkillTree";
import { FloatingParticles } from "../../components/gamification/Particles";
import { StreakFlame } from "../../components/gamification/StreakFlame";
import { XPBar } from "../../components/gamification/XPBar";

export function SkillTreePage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { streak } = useGame();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    Promise.all([
      api.get<Subject>(`/curriculum/subjects/${subjectId}`),
      api.get<Concept[]>(`/curriculum/subjects/${subjectId}/concepts`),
    ])
      .then(async ([subj, concs]) => {
        setSubject(subj);
        setConcepts(concs);
        const allLessons: Lesson[] = [];
        for (const c of concs) {
          const l = await api.get<Lesson[]>(`/curriculum/concepts/${c.id}/lessons`);
          allLessons.push(...l);
        }
        setLessons(allLessons);
        // Load completed from localStorage
        try {
          const saved = localStorage.getItem("completed-lessons");
          if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
        } catch {}
      })
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/40 to-indigo-900/30 overflow-hidden">
      <FloatingParticles />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
            <p className="text-sm text-purple-300">{concepts.length} concepts · {lessons.length} lessons</p>
          </div>
          <div className="flex items-center gap-4">
            <StreakFlame streak={streak} />
            <div className="w-48">
              <XPBar />
            </div>
          </div>
        </div>

        {/* Skill tree */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <SkillTree
            subject={subject}
            concepts={concepts}
            lessons={lessons}
            completedLessons={completedLessons}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-xs text-purple-300">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span>In progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gray-600" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
