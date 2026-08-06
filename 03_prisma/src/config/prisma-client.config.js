import dotenv from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

dotenv.config()

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export default new PrismaClient({adapter})

