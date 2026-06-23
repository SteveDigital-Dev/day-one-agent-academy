import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Subject, Concept, Lesson } from "../../api/client";

interface SkillTreeProps {
  subject: Subject;
  concepts: Concept[];
  lessons: Lesson[];
  completedLessons: Set<string>;
}

interface TreeNode {
  concept: Concept;
  lessons: Lesson[];
  x: number;
  y: number;
  completed: number;
  total: number;
}

export function SkillTree({ subject, concepts, lessons, completedLessons }: SkillTreeProps) {
  const nodes = useMemo(() => {
    const treeNodes: TreeNode[] = [];
    const width = 900;
    const height = Math.max(400, concepts.length * 140);

    concepts.forEach((concept, i) => {
      const conceptLessons = lessons.filter((l) => l.concept_id === concept.id);
      const completed = conceptLessons.filter((l) => completedLessons.has(l.id)).length;

      const col = i % 3;
      const row = Math.floor(i / 3);

      treeNodes.push({
        concept,
        lessons: conceptLessons,
        x: 150 + col * 300,
        y: 100 + row * 180,
        completed,
        total: conceptLessons.length,
      });
    });

    return treeNodes;
  }, [concepts, lessons, completedLessons]);

  const connections = useMemo(() => {
    const lines: { from: TreeNode; to: TreeNode }[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const nextIdx = i + 1;
      if (nextIdx < nodes.length) {
        lines.push({ from: nodes[i], to: nodes[nextIdx] });
      }
      // Connect to the one below as well
      const belowIdx = i + 3;
      if (belowIdx < nodes.length) {
        lines.push({ from: nodes[i], to: nodes[belowIdx] });
      }
    }
    return lines;
  }, [nodes]);

  const getStatus = (node: TreeNode) => {
    if (node.completed === node.total) return "complete";
    if (node.completed > 0) return "in-progress";
    return "locked";
  };

  const statusColors = {
    complete: { fill: "#10b981", stroke: "#059669", glow: "drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" },
    "in-progress": { fill: "#8b5cf6", stroke: "#7c3aed", glow: "drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]" },
    locked: { fill: "#374151", stroke: "#4b5563", glow: "" },
  };

  const svgWidth = 900;
  const svgHeight = Math.max(400, concepts.length * 140);

  return (
    <div className="relative overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="mx-auto"
      >
        {/* Background stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <circle
            key={`star-${i}`}
            cx={Math.random() * svgWidth}
            cy={Math.random() * svgHeight}
            r={Math.random() * 1.5 + 0.5}
            fill="white"
            opacity={Math.random() * 0.3 + 0.05}
          />
        ))}

        {/* Connection lines */}
        {connections.map(({ from, to }, i) => {
          const fromStatus = getStatus(from);
          const toStatus = getStatus(to);
          const isActive = fromStatus === "complete";
          return (
            <line
              key={`conn-${i}`}
              x1={from.x}
              y1={from.y + 35}
              x2={to.x}
              y2={to.y - 35}
              stroke={isActive ? "#8b5cf6" : "#374151"}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray={isActive ? "none" : "6 4"}
              opacity={isActive ? 0.8 : 0.3}
            />
          );
        })}

        {/* Concept nodes */}
        {nodes.map((node, i) => {
          const status = getStatus(node);
          const colors = statusColors[status];
          const progress = node.total > 0 ? node.completed / node.total : 0;

          return (
            <g key={node.concept.id}>
              {/* Glow effect */}
              {status !== "locked" && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={42}
                  fill="none"
                  stroke={colors.fill}
                  strokeWidth={2}
                  opacity={0.3}
                />
              )}

              {/* Progress ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={35}
                fill="none"
                stroke="#1f2937"
                strokeWidth={4}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={35}
                fill="none"
                stroke={colors.fill}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${progress * 220} 220`}
                transform={`rotate(-90 ${node.x} ${node.y})`}
                className="transition-all duration-500"
              />

              {/* Node background */}
              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={2}
                className={`${colors.glow} cursor-pointer`}
              />

              {/* Status icon */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize={status === "complete" ? 20 : 16}
                className="cursor-pointer select-none"
              >
                {status === "complete" ? "✓" : status === "in-progress" ? "📖" : "🔒"}
              </text>

              {/* Label */}
              <text
                x={node.x}
                y={node.y + 55}
                textAnchor="middle"
                fill="#e5e7eb"
                fontSize={12}
                fontWeight="600"
                className="select-none"
              >
                {node.concept.name.replace(subject.name + " — ", "")}
              </text>
              <text
                x={node.x}
                y={node.y + 70}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={10}
                className="select-none"
              >
                {node.completed}/{node.total} lessons
              </text>
            </g>
          );
        })}
      </svg>

      {/* Clickable overlays */}
      {nodes.map((node) => {
        const status = getStatus(node);
        const firstLesson = node.lessons.sort((a, b) => a.order_index - b.order_index)[0];
        if (!firstLesson) return null;

        return (
          <Link
            key={node.concept.id}
            to={`/dashboard/lessons/${firstLesson.id}`}
            className="absolute block"
            style={{
              left: `${(node.x / svgWidth) * 100}%`,
              top: `${(node.y / svgHeight) * 100}%`,
              width: 60,
              height: 60,
              marginLeft: -30,
              marginTop: -30,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="w-full h-full rounded-full"
            />
          </Link>
        );
      })}
    </div>
  );
}
