import { IContext } from "@verida/types"
import { VeridaDataSource } from "./VeridaDataSource"

export const VeridaDataSourceFactory = async <Type>(context: IContext, databaseName: string) => {
    const db = await context!.openDatabase(databaseName, {})
    return new VeridaDataSource<Type>(db)
}