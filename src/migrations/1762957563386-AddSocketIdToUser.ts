import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSocketIdToUser1762957563386 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("user", new TableColumn({
            name: "socketId",
            type: "varchar",
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "socketId");
    }

}