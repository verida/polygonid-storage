import { AbstractPrivateKeyStore } from "@0xpolygonid/js-sdk";
import { IDatabase } from "@verida/types";

export class VeridaPrivateKeyStore implements AbstractPrivateKeyStore {
  private database: IDatabase

  public constructor(database: IDatabase) {
    this.database = database
  }

  /**
   * imports key by alias
   *
   * @abstract
   * @param {{ alias: string; key: string }} args - key alias and hex representation
   * @returns `Promise<void>`
   */
  public async import(args: { alias: string; key: string }): Promise<void> {
    const record: any = {
      _id: args.alias,
      value: args.key,
    }

    try {
      const existingRecord: any = await this.database.get(args.alias)
      record._rev = existingRecord._rev
    } catch (err: any) {
      // not found, which is fine
    }

    // may throw save error
    await this.database.save(record)
  }
  /**
   * get key by alias
   *
   * @abstract
   * @param {{ alias: string }} args -key alias
   * @returns `Promise<string>`
   */
  public async get(args: { alias: string }): Promise<string> {
    try {
      const result: any = await this.database.get(args.alias)
      if (!result) {
        throw new Error('no key under given alias')
      }

      return result.value
    } catch (err) {
      throw new Error('no key under given alias')
    }
  }
}