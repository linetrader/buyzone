import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getUserId } from "@/lib/request-user"; 

// --- 타입 정의 ---
interface NodeData {
    label: string;
    level: number;
    code: string;
    joinDate: string;
}

interface ReactFlowNode { 
    id: string; 
    data: NodeData; 
    position: { x: number; y: number }; 
    type: string; 
}

interface ReactFlowEdge { 
    id: string; 
    source: string; 
    target: string; 
    type: string; 
    animated: boolean; 
}

// 재귀적 User 타입 정의 (3단계 깊이에 맞춰 구조화)
type SponseeBase = {
    id: string; username: string; level: number; referralCode: string; createdAt: Date;
};
type SponseeDepth3 = SponseeBase;
type SponseeDepth2 = SponseeBase & { sponsees: SponseeDepth3[] };
type SponseeDepth1 = SponseeBase & { sponsees: SponseeDepth2[] };
type PrismaRootUser = SponseeBase & { sponsees: SponseeDepth1[] };

// ✅ [수정] AnyReferredUser 타입 정의 추가 (오류 해결)
type AnyReferredUser = PrismaRootUser | SponseeDepth1 | SponseeDepth2 | SponseeDepth3;
// ----------------------------------------------------


export async function GET() { 
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 재귀적으로 하위 3단계까지 데이터 조회 (Prisma include 활용)
    const rootUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, level: true, referralCode: true, createdAt: true,
        sponsees: { // Depth 1 (후원 관계)
          select: {
            id: true, username: true, level: true, referralCode: true, createdAt: true,
            sponsees: { // Depth 2
              select: {
                id: true, username: true, level: true, referralCode: true, createdAt: true,
                sponsees: { // Depth 3
                  select: {
                    id: true, username: true, level: true, referralCode: true, createdAt: true,
                  }
                }
              }
            }
          }
        }
      }
    }) as PrismaRootUser | null; 

    if (!rootUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. React Flow용 Node/Edge 데이터로 변환
    const nodes: ReactFlowNode[] = []; 
    const edges: ReactFlowEdge[] = []; 
    
    const processedNodeIds = new Set<string>();
    const processedEdgeIds = new Set<string>();

    // 재귀적으로 노드와 엣지를 생성하는 헬퍼 함수
    const processUser = (user: AnyReferredUser, parentId: string | null = null) => {
      
      // 3-1. 노드 중복 확인
      if (!processedNodeIds.has(user.id)) {
          // 노드 추가 
          nodes.push({
            id: user.id,
            data: { 
              label: user.username,
              level: user.level, 
              code: user.referralCode,
              joinDate: user.createdAt instanceof Date 
                ? user.createdAt.toLocaleDateString() 
                : new Date(user.createdAt).toLocaleDateString()
            },
            position: { x: 0, y: 0 }, 
            type: 'customNode',
          } as ReactFlowNode); // 캐스팅하여 타입 오류 방지
          processedNodeIds.add(user.id);
      }
      
      // 3-2. 엣지 추가 (부모가 있을 경우)
      if (parentId) {
          const edgeId = `e${parentId}-${user.id}`;
          
          if (!processedEdgeIds.has(edgeId)) {
              edges.push({
                id: edgeId, 
                source: parentId,
                target: user.id,
                type: 'smoothstep',
                animated: true,
              } as ReactFlowEdge); // 캐스팅하여 타입 오류 방지
              processedEdgeIds.add(edgeId);
          }
      }

      // 3-3. 자식들 순회 (sponsees 사용)
      const userWithSponsees = user as { sponsees?: SponseeBase[] }; 
      if (userWithSponsees.sponsees && userWithSponsees.sponsees.length > 0) {
        userWithSponsees.sponsees.forEach((child: SponseeBase) => processUser(child as AnyReferredUser, user.id));
      }
    };

    processUser(rootUser, null);

    return NextResponse.json({ nodes, edges });

  } catch (error) {
    console.error("Sponsor Tree API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}