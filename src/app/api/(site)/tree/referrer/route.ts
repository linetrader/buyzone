import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getUserId } from "@/lib/request-user"; 

// --- [수정] 타입 정의 ---
// React Flow Node Data 정의
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
type ReferredBase = {
    id: string; username: string; level: number; referralCode: string; createdAt: Date;
};
type ReferredDepth3 = ReferredBase;
type ReferredDepth2 = ReferredBase & { referred: ReferredDepth3[] };
type ReferredDepth1 = ReferredBase & { referred: ReferredDepth2[] };
type PrismaRootUser = ReferredBase & { referred: ReferredDepth1[] };

// 모든 깊이의 유저 타입을 통합 (processUser 매개변수용)
type AnyReferredUser = PrismaRootUser | ReferredDepth1 | ReferredDepth2 | ReferredDepth3;
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
        referred: { // Depth 1
          select: {
            id: true, username: true, level: true, referralCode: true, createdAt: true,
            referred: { // Depth 2
              select: {
                id: true, username: true, level: true, referralCode: true, createdAt: true,
                referred: { // Depth 3
                  select: {
                    id: true, username: true, level: true, referralCode: true, createdAt: true,
                  }
                }
              }
            }
          }
        }
      }
    }) as PrismaRootUser | null; // 조회된 결과를 정의된 타입으로 캐스팅

    if (!rootUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. React Flow용 Node/Edge 데이터로 변환
    const nodes: ReactFlowNode[] = []; 
    const edges: ReactFlowEdge[] = []; 
    
    const processedNodeIds = new Set<string>();
    const processedEdgeIds = new Set<string>();

    // 재귀적으로 노드와 엣지를 생성하는 헬퍼 함수
    // ✅ [수정 1] user 타입을 AnyReferredUser로, child 타입을 AnyReferredUser의 일부로 지정하여 any 해결
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
              // Date 객체 처리
              joinDate: user.createdAt instanceof Date 
                ? user.createdAt.toLocaleDateString() 
                : new Date(user.createdAt).toLocaleDateString()
            },
            position: { x: 0, y: 0 }, 
            type: 'customNode',
          });
          processedNodeIds.add(user.id);
      }
      
      // 3-2. 엣지 추가 (부모가 있을 경우)
      if (parentId) {
          const edgeId = `e${parentId}-${user.id}`;
          
          if (!processedEdgeIds.has(edgeId)) {
              edges.push({
                id: edgeId, // 엣지 ID 생성
                source: parentId,
                target: user.id,
                type: 'smoothstep',
                animated: true,
              });
              processedEdgeIds.add(edgeId);
          }
      }

      // 3-3. 자식들 순회
      const userWithReferred = user as { referred?: ReferredBase[] }; // referred 속성이 있을 수 있는 타입으로 캐스팅
      if (userWithReferred.referred && userWithReferred.referred.length > 0) {
        // ✅ [수정 2] child 타입 명시 (86:49, 86:65, 127:56 any 해결)
        userWithReferred.referred.forEach((child: ReferredBase) => processUser(child as AnyReferredUser, user.id));
      }
    };

    processUser(rootUser, null);

    return NextResponse.json({ nodes, edges });

  } catch (error) {
    console.error("Tree API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}