import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";


const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export default new PrismaClient({adapter})

