/*
  Warnings:

  - You are about to drop the column `capacidade_max` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `data_hora` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `host_id` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `local_texto` on the `Event` table. All the data in the column will be lost.
  - Added the required column `capacidadeMax` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataHora` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localTexto` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_host_id_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "capacidade_max",
DROP COLUMN "criado_em",
DROP COLUMN "data_hora",
DROP COLUMN "host_id",
DROP COLUMN "local_texto",
ADD COLUMN     "capacidadeMax" INTEGER NOT NULL,
ADD COLUMN     "contactUrl" TEXT,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataHora" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hostId" INTEGER NOT NULL,
ADD COLUMN     "localTexto" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
