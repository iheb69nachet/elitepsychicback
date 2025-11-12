import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveChatTables1762957107720 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("message", true);
        await queryRunner.dropTable("chat_request", true);
        await queryRunner.dropTable("room", true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreating tables in down method is complex and usually not done for full table drops.
        // This migration is intended to permanently remove these tables.
        // If you need to revert, you would typically restore from a backup or manually recreate.
        console.log("Reverting this migration would require manual table recreation.");
    }

}