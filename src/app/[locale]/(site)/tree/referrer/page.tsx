"use client";

import React, { useCallback, useEffect, useState } from "react";
// ✅ [수정] Node, Edge는 타입으로 명확히 임포트
import type { Node, Edge } from "reactflow"; 
import ReactFlow, { 
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  Panel,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import dagre from "dagre";
import { User, BadgeCheck, Calendar, RefreshCw } from "lucide-react";

// --- Custom Node 데이터 타입 정의 ---
// 이 타입 정의가 누락되면 useNodesState에서 타입 오류가 발생합니다.
interface NodeData {
  label: string;
  level: number;
  code: string;
  joinDate: string;
}

interface CustomNodeProps {
    data: NodeData;
    isConnectable: boolean;
}

// --- 1. 커스텀 노드 컴포넌트 ---
const CustomNode = ({ data }: CustomNodeProps) => { // 'any' 제거
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
      <div className="bg-[#4F46E5] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <span className="text-white font-bold text-sm truncate max-w-[100px]">
            {data.label}
          </span>
        </div>
        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
          Lv.{data.level}
        </span>
      </div>
      <div className="p-3 space-y-2 bg-white">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><BadgeCheck size={12} /> 코드</span>
          <span className="font-mono text-gray-700">{data.code}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><Calendar size={12} /> 가입일</span>
          <span>{data.joinDate}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#4F46E5] !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

// --- 2. Dagre 레이아웃 설정 ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 220;
const nodeHeight = 150;

// ✅ [수정] Node<NodeData>[] 및 Edge[] 타입 지정 (any 제거)
const getLayoutedElements = (nodes: Node<NodeData>[], edges: Edge[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node<NodeData>[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- 더미 데이터 ---
const INITIAL_NODES: Node<NodeData>[] = [
  { id: '1', type: 'customNode', data: { label: 'Root Master', level: 5, code: 'MASTER', joinDate: '2024-01-01' }, position: { x: 0, y: 0 } },
  { id: '2', type: 'customNode', data: { label: 'Partner A', level: 3, code: 'PARTNER_A', joinDate: '2024-02-15' }, position: { x: 0, y: 0 } },
  { id: '3', type: 'customNode', data: { label: 'Partner B', level: 2, code: 'PARTNER_B', joinDate: '2024-03-10' }, position: { x: 0, y: 0 } },
  { id: '4', type: 'customNode', data: { label: 'Sub User A-1', level: 1, code: 'USER_A1', joinDate: '2024-04-05' }, position: { x: 0, y: 0 } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: '#4F46E5' } } as Edge,
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, style: { stroke: '#4F46E5' } } as Edge,
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true, style: { stroke: '#4F46E5' } } as Edge,
];

// ✅ [수정] Edge[] 타입 지정 (any 제거)
const ensureUniqueEdges = (edges: Edge[]): Edge[] => {
  const seen = new Set();
  return edges.filter(edge => {
    if (seen.has(edge.id)) {
      console.error("Critical Error: Duplicate Edge ID removed:", edge.id);
      return false;
    }
    seen.add(edge.id);
    return true;
  });
};

// --- 3. 메인 페이지 컴포넌트 ---
export default function ReferrerTreePage() {
  // ✅ [최종 수정] useNodesState의 제네릭 인수를 NodeData로 지정하여 타입 중첩 문제 해결
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]); 
  // useEdgesState는 Edge 타입을 인수로 받습니다.
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]); 
  const [loading, setLoading] = useState(true);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tree/referrer");
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      console.log("API Response Data (Nodes count):", data.nodes?.length);
      console.log("API Response Data (Edges count):", data.edges?.length);

      if (data.nodes && data.nodes.length > 0) {
        // API로부터 받은 데이터를 타입 캐스팅 후 사용
        const apiNodes = data.nodes as Node<NodeData>[];
        const apiEdges = data.edges as Edge[];

        const uniqueEdges = ensureUniqueEdges(apiEdges);
        
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(apiNodes, uniqueEdges);
        // ✅ 이제 layoutedNodes는 SetStateAction<Node<NodeData>[]> 타입에 올바르게 할당됩니다.
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } else {
        throw new Error("No Data");
      }
    } catch (error) {
      console.warn("데이터 로드 실패, 더미 데이터를 표시합니다.", error);
      
      // 더미 데이터 사용
      const uniqueDummyEdges = ensureUniqueEdges(INITIAL_EDGES);
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        INITIAL_NODES,
        uniqueDummyEdges
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]); 

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 조직도 노드가 0개일 때 표시
  const showEmptyMessage = !loading && nodes.length === 0;

  return (
    <div className="w-full h-[calc(100vh-80px)] min-h-[600px] bg-gray-50 relative border-t border-gray-200">
      
      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <span className="loading loading-spinner loading-lg text-[#4F46E5]"></span>
            <span className="text-sm text-gray-500 font-bold">조직도 불러오는 중...</span>
          </div>
        </div>
      )}
      
      {/* 데이터가 없을 때 메시지 */}
      {showEmptyMessage && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center text-gray-500 p-10 bg-white rounded-xl shadow-lg border border-gray-200">
            <User size={40} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-lg font-bold">조직도 데이터가 없습니다.</h2>
            <p className="text-sm mt-1">첫 번째 추천인이 되어 조직을 구축하세요.</p>
          </div>
        </div>
      )}

      {/* React Flow 캔버스 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-right"
        className={showEmptyMessage ? "opacity-0" : "opacity-100 transition-opacity"}
      >
        <Background color="#ccc" gap={20} size={1} />
        <Controls className="bg-white shadow-xl border border-gray-100 rounded-lg" />
        <MiniMap 
          nodeStrokeColor="#4F46E5" 
          nodeColor="#eef2ff" 
          maskColor="rgba(240, 240, 240, 0.6)"
          className="border border-gray-200 shadow-xl rounded-lg overflow-hidden"
        />
        
        {/* 상단 정보 패널 */}
        <Panel position="top-left" className="m-4">
          <div className="bg-white/90 backdrop-blur px-5 py-4 rounded-2xl shadow-lg border border-gray-200">
            <h1 className="text-xl font-extrabold text-gray-900">추천 조직도</h1>
            <p className="text-sm text-gray-500 mt-1">마우스 휠로 확대/축소 가능합니다.</p>
            <div className="mt-3 flex gap-2">
                <button 
                    onClick={loadData}
                    className="btn btn-xs btn-outline border-gray-300 gap-1 hover:bg-gray-50 hover:text-gray-900"
                >
                    <RefreshCw size={12} /> 새로고침
                </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}