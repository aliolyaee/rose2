import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1756215710082 implements MigrationInterface {
    name = 'Migrations1756215710082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item_categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "icon" character varying(100) NOT NULL, "restaurantId" integer NOT NULL, CONSTRAINT "uq_item_categories_restaurant_name" UNIQUE ("restaurantId", "name"), CONSTRAINT "PK_db3359595abacbe15cf2f89c07e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_item_categories_restaurant_id" ON "item_categories" ("restaurantId") `);
        await queryRunner.query(`CREATE TABLE "menu_items" ("id" SERIAL NOT NULL, "image" character varying(400), "title" character varying(100) NOT NULL, "description" text, "fee" bigint NOT NULL DEFAULT '0', "available" boolean NOT NULL DEFAULT true, "categoryId" integer, CONSTRAINT "PK_57e6188f929e5dc6919168620c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "fee" bigint NOT NULL, "orderId" integer, "menuItemId" integer, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "customerName" character varying(100) NOT NULL, "phoneNumber" character varying(15) NOT NULL, "description" text, "totalPrice" bigint NOT NULL, "trackingCode" character varying(16) NOT NULL, "clientId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tableId" integer NOT NULL, CONSTRAINT "UQ_511b33006181ed92b8c9a65138e" UNIQUE ("trackingCode"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "phone" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aa22377d7d3e794ae4cd39cd9e5" UNIQUE ("phone"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservations" ("id" SERIAL NOT NULL, "date" character varying NOT NULL, "hour" character varying NOT NULL, "duration" integer NOT NULL, "people" integer NOT NULL, "phone" character varying NOT NULL, "description" character varying, "trackingCode" character varying NOT NULL, "clientId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tableId" integer, CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tables" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "capacity" integer NOT NULL, "photo" character varying NOT NULL, "restaurantId" integer, CONSTRAINT "PK_7cf2aca7af9550742f855d4eb69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resturants" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_9759a08288368ff47c12585e199" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "fullName" character varying(100) NOT NULL, "username" character varying(100) NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "password" character varying(100) NOT NULL, "lastLogin" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "sessionId" character varying(60) NOT NULL, "ordered" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "menuItemId" integer, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "location" character varying NOT NULL, "alt" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "item_categories" ADD CONSTRAINT "FK_c3ffaad581485b6bf71a0b8db2f" FOREIGN KEY ("restaurantId") REFERENCES "resturants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD CONSTRAINT "FK_d56e5ccc298e8bf721f75a7eb96" FOREIGN KEY ("categoryId") REFERENCES "item_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2a7fdd7af437285a3ef0fc8b64f" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1457f286d91f271313fded23e53" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_42ee40914a466cb26141c81e878" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_e31637a1b37f007468858cd3855" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_94e0a6541322cecd437cd841701" FOREIGN KEY ("restaurantId") REFERENCES "resturants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_552c64548c3038c2480254cea53" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_552c64548c3038c2480254cea53"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_94e0a6541322cecd437cd841701"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_e31637a1b37f007468858cd3855"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_42ee40914a466cb26141c81e878"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1457f286d91f271313fded23e53"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_2a7fdd7af437285a3ef0fc8b64f"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "menu_items" DROP CONSTRAINT "FK_d56e5ccc298e8bf721f75a7eb96"`);
        await queryRunner.query(`ALTER TABLE "item_categories" DROP CONSTRAINT "FK_c3ffaad581485b6bf71a0b8db2f"`);
        await queryRunner.query(`DROP TABLE "images"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "resturants"`);
        await queryRunner.query(`DROP TABLE "tables"`);
        await queryRunner.query(`DROP TABLE "reservations"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "menu_items"`);
        await queryRunner.query(`DROP INDEX "public"."idx_item_categories_restaurant_id"`);
        await queryRunner.query(`DROP TABLE "item_categories"`);
    }

}
