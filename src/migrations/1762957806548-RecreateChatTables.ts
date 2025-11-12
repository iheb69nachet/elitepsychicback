import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class RecreateChatTables1762957806548 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ChatRequest table
        await queryRunner.createTable(new Table({
            name: "chat_request",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "clientId",
                    type: "int",
                },
                {
                    name: "psychicId",
                    type: "int",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "accepted", "rejected", "cancelled"],
                    default: "'pending'",
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
        }), true); // 'true' means if not exists

        // Add foreign keys to ChatRequest table
        await queryRunner.createForeignKey("chat_request", new TableForeignKey({
            columnNames: ["clientId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("chat_request", new TableForeignKey({
            columnNames: ["psychicId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE",
        }));

        // Create Room table
        await queryRunner.createTable(new Table({
            name: "room",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "clientId",
                    type: "int",
                },
                {
                    name: "psychicId",
                    type: "int",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["active", "ended"],
                    default: "'active'",
                },
                {
                    name: "clientJoined",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "psychicJoined",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "timerStarted",
                    type: "boolean",
                    default: false,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP",
                },
            ],
        }), true);

        // Add foreign keys to Room table
        await queryRunner.createForeignKey("room", new TableForeignKey({
            columnNames: ["clientId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("room", new TableForeignKey({
            columnNames: ["psychicId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE",
        }));

        // Create Message table
        await queryRunner.createTable(new Table({
            name: "message",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "senderId",
                    type: "int",
                },
                {
                    name: "roomId",
                    type: "int",
                },
                {
                    name: "content",
                    type: "text",
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
        }), true);

        // Add foreign keys to Message table
        await queryRunner.createForeignKey("message", new TableForeignKey({
            columnNames: ["senderId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey("message", new TableForeignKey({
            columnNames: ["roomId"],
            referencedColumnNames: ["id"],
            referencedTableName: "room",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to avoid foreign key constraints issues
        await queryRunner.dropTable("message", true);
        await queryRunner.dropTable("room", true);
        await queryRunner.dropTable("chat_request", true);
    }

}