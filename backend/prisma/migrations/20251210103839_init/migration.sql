-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MarriageStatus" AS ENUM ('MARRIED', 'DIVORCED', 'SEPARATED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BIRTH_CERTIFICATE', 'DEATH_CERTIFICATE', 'MARRIAGE_CERTIFICATE', 'DIVORCE_PAPERS', 'MILITARY_RECORD', 'IMMIGRATION_RECORD', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BIRTH', 'DEATH', 'MARRIAGE', 'DIVORCE', 'GRADUATION', 'MILITARY_SERVICE', 'IMMIGRATION', 'REUNION', 'OTHER');

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "maidenName" TEXT,
    "nicknames" TEXT[],
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "dateOfDeath" TIMESTAMP(3),
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "occupation" TEXT,
    "profilePhoto" TEXT,
    "biologicalFatherId" TEXT,
    "biologicalMotherId" TEXT,
    "adoptiveParentId" TEXT,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marriage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spouse1Id" TEXT NOT NULL,
    "spouse2Id" TEXT NOT NULL,
    "marriageDate" TIMESTAMP(3),
    "divorceDate" TIMESTAMP(3),
    "marriagePlace" TEXT,
    "status" "MarriageStatus" NOT NULL DEFAULT 'MARRIED',
    "notes" TEXT,

    CONSTRAINT "Marriage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "dateTaken" TIMESTAMP(3),
    "location" TEXT,
    "personId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "personId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "storyDate" TIMESTAMP(3),
    "personId" TEXT NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "eventType" "EventType" NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdoptedChild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdoptedChild_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Person_dateOfBirth_idx" ON "Person"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Person_biologicalFatherId_idx" ON "Person"("biologicalFatherId");

-- CreateIndex
CREATE INDEX "Person_biologicalMotherId_idx" ON "Person"("biologicalMotherId");

-- CreateIndex
CREATE INDEX "Marriage_spouse1Id_idx" ON "Marriage"("spouse1Id");

-- CreateIndex
CREATE INDEX "Marriage_spouse2Id_idx" ON "Marriage"("spouse2Id");

-- CreateIndex
CREATE INDEX "Photo_personId_idx" ON "Photo"("personId");

-- CreateIndex
CREATE INDEX "Document_personId_idx" ON "Document"("personId");

-- CreateIndex
CREATE INDEX "Story_personId_idx" ON "Story"("personId");

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE INDEX "_AdoptedChild_B_index" ON "_AdoptedChild"("B");

-- CreateIndex
CREATE INDEX "_EventSubject_B_index" ON "_EventSubject"("B");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_biologicalFatherId_fkey" FOREIGN KEY ("biologicalFatherId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_biologicalMotherId_fkey" FOREIGN KEY ("biologicalMotherId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_adoptiveParentId_fkey" FOREIGN KEY ("adoptiveParentId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_spouse1Id_fkey" FOREIGN KEY ("spouse1Id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_spouse2Id_fkey" FOREIGN KEY ("spouse2Id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdoptedChild" ADD CONSTRAINT "_AdoptedChild_A_fkey" FOREIGN KEY ("A") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdoptedChild" ADD CONSTRAINT "_AdoptedChild_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventSubject" ADD CONSTRAINT "_EventSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventSubject" ADD CONSTRAINT "_EventSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
