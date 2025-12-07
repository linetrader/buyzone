-- CreateTable
CREATE TABLE "public"."SponsorEdge" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "groupNo" INTEGER,
    "position" INTEGER,
    "depth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsorEdge_parentId_groupNo_position_idx" ON "public"."SponsorEdge"("parentId", "groupNo", "position");

-- CreateIndex
CREATE INDEX "SponsorEdge_childId_idx" ON "public"."SponsorEdge"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorEdge_childId_key" ON "public"."SponsorEdge"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorEdge_parentId_childId_key" ON "public"."SponsorEdge"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "SponsorEdge_parentId_groupNo_position_key" ON "public"."SponsorEdge"("parentId", "groupNo", "position");

-- AddForeignKey
ALTER TABLE "public"."SponsorEdge" ADD CONSTRAINT "SponsorEdge_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SponsorEdge" ADD CONSTRAINT "SponsorEdge_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
