
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Role } from "./entities/Role";
import { Package } from "./entities/Package";
import { Transaction } from "./entities/Transaction";
import { PsychicSetting } from "./entities/PsychicSetting";
import { Blog } from "./entities/Blog";
import { RemedyAndSpell } from "./entities/RemedyAndSpell";

import { Message } from "./entities/Message";
import { ChatRequest } from "./entities/ChatRequest";
import { Room } from "./entities/Room";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "yourpassword",
    database: "aura",
    synchronize: false,
    logging: false,
    entities: [User, Role, Package, Transaction, Message, PsychicSetting, Blog, ChatRequest, Room, RemedyAndSpell],
    migrations: ["src/migrations/*.ts"],
    subscribers: [],
});

