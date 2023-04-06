import { IDataSource } from "@0xpolygonid/js-sdk"
import { IDatabase } from "@verida/types"

/**
 * Generic data source
 */
export class VeridaDataSource<Type> implements IDataSource<Type> {
    private database: IDatabase
  
    public constructor(database: IDatabase) {
      this.database = database
    }
  
    /** save to the network */
    public async save(key: string, value: Type, keyName = 'id'): Promise<void> {
      let record: any = {}
      try {
        record = await this.database.get(key)
      } catch (err: any) {
        record._id = key
        record.data = value
      }
  
      await this.database.save(record)
    }
  
    /** not supported */
    patchData(value: Type[]): void {
      throw new Error('patchData Not supported')
    }
  
    /** gets value from from the memory */
    public async get(key: string, keyName = 'id'): Promise<Type | undefined> {
      try {
        const result: any = <Type>await this.database.get(key)
        return result.data
      } catch (err) {
        if (err.name == 'not_found') {
          return
        }

        throw err
      }
    }
  
    /** loads from value from the network */
    public async load(): Promise<Type[]> {
      const data = <Type[]>await this.database.getMany(
        {},
        {
          limit: 1000,
        }
      )
  
      return data.map((item: any) => item.data)
    }
  
    /** deletes from value from the network */
    public async delete(key: string, keyName = 'id'): Promise<void> {
      const record: any = await this.database.get(key)
      await this.database.delete(record)
    }
  }