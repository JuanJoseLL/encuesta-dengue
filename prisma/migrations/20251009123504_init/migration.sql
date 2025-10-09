-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scenario_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "tags" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Respondent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "organization" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RespondentInvite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RespondentInvite_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResponseSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "respondentId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "progress" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "currentScenarioId" TEXT,
    "metadata" TEXT,
    CONSTRAINT "ResponseSession_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResponseSession_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "scenarioId" TEXT,
    "payload" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Survey_active_idx" ON "Survey"("active");

-- CreateIndex
CREATE INDEX "Scenario_surveyId_order_idx" ON "Scenario"("surveyId", "order");

-- CreateIndex
CREATE INDEX "Scenario_active_idx" ON "Scenario"("active");

-- CreateIndex
CREATE INDEX "Indicator_active_idx" ON "Indicator"("active");

-- CreateIndex
CREATE INDEX "Indicator_domain_idx" ON "Indicator"("domain");

-- CreateIndex
CREATE INDEX "Respondent_role_idx" ON "Respondent"("role");

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
CREATE INDEX "Response_sessionId_scenarioId_idx" ON "Response"("sessionId", "scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_sessionId_scenarioId_indicatorId_key" ON "Response"("sessionId", "scenarioId", "indicatorId");

-- CreateIndex
CREATE INDEX "SessionLog_sessionId_timestamp_idx" ON "SessionLog"("sessionId", "timestamp");
