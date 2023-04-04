import { IndexedDBStorage, Merkletree, str2Bytes } from '@iden3/js-merkletree';
import * as uuid from 'uuid';

import { IMerkleTreeStorage, IdentityMerkleTreeMetaInformation, MerkleTreeType } from '@0xpolygonid/js-sdk'
import { VeridaDataSource } from './data-source';

const mtTypes = [MerkleTreeType.Claims, MerkleTreeType.Revocations, MerkleTreeType.Roots];

/**
 * Merkle tree storage that uses browser indexed db storage
 *
 * @export
 * @beta
 * @class MerkleTreeIndexedDBStorage
 * @implements implements IMerkleTreeStorage interface
 */
export class VeridaMerkleTreeStorage implements IMerkleTreeStorage {

  private readonly _merkleTreeMetaStore: VeridaDataSource<any>;

  /**
   * Creates an instance of MerkleTreeIndexedDBStorage.
   * @param {number} _mtDepth
   */
  constructor(private readonly _mtDepth: number, datasource: VeridaDataSource<any>) {
    this._merkleTreeMetaStore = datasource
  }

  /** creates a tree in the indexed db storage */
  async createIdentityMerkleTrees(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }
    const createMetaInfo = () => {
      const treesMeta: IdentityMerkleTreeMetaInformation[] = [];
      for (let index = 0; index < mtTypes.length; index++) {
        const mType = mtTypes[index];
        const treeId = identifier.concat('+' + mType.toString());
        const metaInfo = { treeId, identifier, type: mType };
        treesMeta.push(metaInfo);
      }
      return treesMeta;
    };
    const meta = await this._merkleTreeMetaStore.get(identifier);
    if (meta) {
      return meta;
    }
    const treesMeta = createMetaInfo();
    await this._merkleTreeMetaStore.save(identifier, treesMeta)
    return treesMeta;
  }
  /**
   *
   * getIdentityMerkleTreesInfo from the indexed db storage
   * @param {string} identifier
   * @returns `{Promise<IdentityMerkleTreeMetaInformation[]>}`
   */
  async getIdentityMerkleTreesInfo(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    const meta = await this._merkleTreeMetaStore.get(identifier);
    if (meta) {
      return meta;
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }

  /** get merkle tree from the indexed db storage */
  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    const meta = await this._merkleTreeMetaStore.get(identifier);
    const err = new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    if (!meta) {
      throw err;
    }

    const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
    if (!resultMeta) {
      throw err;
    }
    return new Merkletree(new IndexedDBStorage(str2Bytes(resultMeta.treeId)), true, this._mtDepth);
  }
  /** adds to merkle tree in the indexed db storage */
  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    const meta = await this._merkleTreeMetaStore.get(identifier);
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
    }
    const resultMeta = meta.find((m) => m.identifier === identifier && m.type === mtType);
    if (!resultMeta) {
      throw new Error(`Merkle tree not found for identifier ${identifier} and type ${mtType}`);
    }

    const tree = new Merkletree(
      new IndexedDBStorage(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth
    );

    await tree.add(hindex, hvalue);
  }

  /** binds merkle tree in the indexed db storage to the new identifiers */
  async bindMerkleTreeToNewIdentifier(oldIdentifier: string, newIdentifier: string): Promise<void> {
    const meta = await this._merkleTreeMetaStore.get(oldIdentifier);
    if (!meta || !meta?.length) {
      throw new Error(`Merkle tree meta not found for identifier ${oldIdentifier}`);
    }

    const treesMeta = meta.map((m) => ({ ...m, identifier: newIdentifier }));

    await this._merkleTreeMetaStore.save(newIdentifier, treesMeta);
    await this._merkleTreeMetaStore.delete(oldIdentifier);
  }
}