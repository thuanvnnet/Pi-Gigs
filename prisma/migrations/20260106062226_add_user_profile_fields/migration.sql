-- AlterTable
ALTER TABLE "users" ADD COLUMN     "facebook_url" VARCHAR(255),
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedin_url" VARCHAR(255),
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "phone" VARCHAR(20),
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "timezone" VARCHAR(50),
ADD COLUMN     "twitter_url" VARCHAR(255),
ADD COLUMN     "website" VARCHAR(255);
