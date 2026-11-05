import React from "react";
import { useEditor } from "../../store/EditorContext";
import { setActiveVariant } from "../../core/actions";
import { childrenOf, rootVariant } from "../../core/cardModel";
import { kindLabel } from "../../core/actions";

// 简单横向树布局：为每个节点计算 (x, y)
function layoutTree(card) {
  const root = rootVariant(card);
  if (!root) return { nodes: [], edges: [] };
  const nodes = [];
  const edges = [];
  const NODE_W = 138;
  const NODE_H = 40;
  const V_GAP = 14;
  let leafCursor = 0;

  const place = (node) => {
    const kids = childrenOf(card, node.id);
    let y;
    if (kids.length === 0) {
      y = leafCursor;
      leafCursor += NODE_H + V_GAP;
    } else {
      const childYs = kids.map(place);
      y = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    }
    const x = depthOf(card, node.id) * (NODE_W + 90);
    nodes.push({ ...node, x, y, kindLabel: kindLabel(node.kind) });
    kids.forEach((k) => {
      edges.push({ from: node.id, to: k.id });
    });
    return y;
  };

  place(root);
  // 若只有根，给个占位高度
  const height = leafCursor + NODE_H;
  return { nodes, edges, height };
}

function depthOf(card, id) {
  let d = 0;
  let cur = card.variants.find((v) => v.id === id);
  while (cur && cur.parentId) {
    d++;
    cur = card.variants.find((v) => v.id === cur.parentId);
  }
  return d;
}

export function TopologyPanel() {
  const { state, dispatch } = useEditor();
  const card = state.card;
  const { nodes, edges, height } = layoutTree(card);
  const active = card.activeVariantId;

  const NODE_W = 138;
  const NODE_H = 40;

  const width = Math.max(320, (depthOf(card, nodes[0]?.id || "") + 1) * (NODE_W + 90) - 90 + 40);
  const topoH = Math.max(height + 10, 120);

  return (
    <div className="topo-wrap">
      <svg width={width} height={Math.min(topoH, 420)} style={{ display: "block", minWidth: "100%" }}>
        {/* 连线 */}
        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from);
          const b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const x1 = a.x + NODE_W;
          const y1 = a.y + NODE_H / 2;
          const x2 = b.x;
          const y2 = b.y + NODE_H / 2;
          const mx = (x1 + x2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none" stroke="#b9c3bb" strokeWidth="1.5"
              />
            </g>
          );
        })}
        {/* 节点 */}
        {nodes.map((n) => {
          const isActive = n.id === active;
          return (
            <g
              key={n.id}
              className={`topo-node ${isActive ? "active" : ""}`}
              onClick={() => dispatch(setActiveVariant(card, n.id))}
              style={{ cursor: "pointer" }}
            >
              <rect
                className="bg"
                x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx={8}
                fill={isActive ? "rgba(47,125,79,0.14)" : "#fff"}
                stroke={isActive ? "var(--accent)" : "#cfd6cf"}
              />
              {!isActive && (
                <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx={8}
                  fill="#fff" stroke="#cfd6cf" strokeWidth="1" />
              )}
              <text x={n.x + 8} y={n.y + NODE_H / 2 - 2} fontSize="11" fontWeight="700" fill="#1c2420">
                {n.label}
              </text>
              <text x={n.x + 8} y={n.y + NODE_H / 2 + 12} fontSize="9" fill="#7a837d">
                {n.kindLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}