import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";
import * as process from "node:process";
config({ path: join(process.cwd(), ".env") });
const { DB, DBHOST, DBUSERNAME, DBPORT, DBPASSWORD } = process.env;
if (!DB || !DBHOST || !DBUSERNAME || !DBPORT || !DBPASSWORD) {
  throw new Error("Please provide all the required environment variables");
}
let dataSource = new DataSource({
  type: "postgres",
  database: DB,
  port: +DBPORT,
  host: DBHOST,
  username: DBUSERNAME,
  password: DBPASSWORD,
  synchronize: false,
  entities: ["dist/**/**/**/*.entity{.ts,.js}", "dist/**/**/*.entity{.ts,.js}"],
  migrations: ["src/migrations/*{.ts,.js}"],
  migrationsTableName: "youtaab_migration_db",
});
export default dataSource;