ALTER TABLE "User" ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

UPDATE "User"
SET
  "firstName" = CASE
    WHEN trim("name") = '' THEN ''
    ELSE split_part(trim("name"), ' ', 1)
  END,
  "lastName" = CASE
    WHEN strpos(trim("name"), ' ') = 0 THEN ''
    ELSE trim(substr(trim("name"), strpos(trim("name"), ' ') + 1))
  END;

ALTER TABLE "User" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP DEFAULT;
