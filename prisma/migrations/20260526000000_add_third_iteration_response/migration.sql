-- CreateTable
CREATE TABLE "ThirdIterationResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "excluded" BOOLEAN NOT NULL DEFAULT false,
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdIterationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThirdIterationResponse_sessionId_strategyId_idx" ON "ThirdIterationResponse"("sessionId", "strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "ThirdIterationResponse_sessionId_strategyId_indicatorId_key" ON "ThirdIterationResponse"("sessionId", "strategyId", "indicatorId");

-- AddForeignKey
ALTER TABLE "ThirdIterationResponse" ADD CONSTRAINT "ThirdIterationResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
