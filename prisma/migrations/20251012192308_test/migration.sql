-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "description" TEXT,
    "objetivo" TEXT,
    "codigo" TEXT,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "associatedIndicators" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Respondent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Respondent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespondentInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RespondentInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseSession" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "currentStrategyId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ResponseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "strategyId" TEXT,
    "payload" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Survey_active_idx" ON "Survey"("active");

-- CreateIndex
CREATE INDEX "Strategy_active_idx" ON "Strategy"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_surveyId_order_key" ON "Strategy"("surveyId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_name_key" ON "Indicator"("name");

-- CreateIndex
CREATE INDEX "Indicator_active_idx" ON "Indicator"("active");

-- CreateIndex
CREATE INDEX "Indicator_domain_idx" ON "Indicator"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Respondent_email_key" ON "Respondent"("email");

-- CreateIndex
CREATE INDEX "Respondent_role_idx" ON "Respondent"("role");

-- CreateIndex
CREATE INDEX "Respondent_email_idx" ON "Respondent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RespondentInvite_token_key" ON "RespondentInvite"("token");

-- CreateIndex
CREATE INDEX "RespondentInvite_token_idx" ON "RespondentInvite"("token");

-- CreateIndex
CREATE INDEX "RespondentInvite_status_idx" ON "RespondentInvite"("status");

-- CreateIndex
CREATE INDEX "RespondentInvite_expiresAt_idx" ON "RespondentInvite"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResponseSession_token_key" ON "ResponseSession"("token");

-- CreateIndex
CREATE INDEX "ResponseSession_token_idx" ON "ResponseSession"("token");

-- CreateIndex
CREATE INDEX "ResponseSession_status_idx" ON "ResponseSession"("status");

-- CreateIndex
CREATE INDEX "ResponseSession_surveyId_idx" ON "ResponseSession"("surveyId");

-- CreateIndex
CREATE INDEX "ResponseSession_respondentId_idx" ON "ResponseSession"("respondentId");

-- CreateIndex
CREATE INDEX "Response_sessionId_strategyId_idx" ON "Response"("sessionId", "strategyId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_sessionId_strategyId_indicatorId_key" ON "Response"("sessionId", "strategyId", "indicatorId");

-- CreateIndex
CREATE INDEX "SessionLog_sessionId_timestamp_idx" ON "SessionLog"("sessionId", "timestamp");

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespondentInvite" ADD CONSTRAINT "RespondentInvite_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseSession" ADD CONSTRAINT "ResponseSession_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseSession" ADD CONSTRAINT "ResponseSession_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLog" ADD CONSTRAINT "SessionLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
