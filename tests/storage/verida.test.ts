import { IDataStorage, defaultEthConnectionConfig, CredentialStorage, W3CCredential, EthStateStorage, EthConnectionConfig, Identity, Profile, IdentityStorage, ICredentialWallet, IIdentityWallet, KmsKeyType, BjjProvider, KMS, IdentityWallet } from "@0xpolygonid/js-sdk"
import { IContext } from "@verida/types"
import { VeridaDataSourceFactory, VeridaMerkleTreeStorage, VeridaPrivateKeyStore } from "../../src/index"

const RPC_URL = 'https://rpc-mumbai.maticvigil.com'
const CONTRACT_ADDRESS = '0x134B1BE34911E39A8397ec6289782989729807a4'

const initDataStorage = async (context: IContext): Promise<IDataStorage> {
    const conf: EthConnectionConfig = defaultEthConnectionConfig
    conf.contractAddress = CONTRACT_ADDRESS
    conf.url = RPC_URL

    const dataStorage = {
      credential: new CredentialStorage(
        await VeridaDataSourceFactory<W3CCredential>(context, 'polygonid_credentials')
      ),
      identity: new IdentityStorage(
        await VeridaDataSourceFactory<Identity>(context, 'polygonid_identity'),
        await VeridaDataSourceFactory<Profile>(context, 'polygonid_profile')
      ),
      mt: new VeridaMerkleTreeStorage(40,  await VeridaDataSourceFactory<Profile>(context, 'polygonid_mt')),
      states: new EthStateStorage(conf),
    }

    return dataStorage
  }

const initIdentityWallet = async(
    context: IContext,
    dataStorage: IDataStorage,
    credentialWallet: ICredentialWallet
  ): Promise<IIdentityWallet> => {
    const privateKeyStoreDatabase = await context.openDatabase(
      'polygonid_keystore',
      {}
    )

    const keyStore = new VeridaPrivateKeyStore(privateKeyStoreDatabase)
    //const keyStore = new InMemoryPrivateKeyStore()
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore)
    const kms = new KMS()
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

    return new IdentityWallet(kms, dataStorage, credentialWallet)
  }