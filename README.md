
# PolygonID Storage

This library provides self-sovereign database storage on the Verida network for PolygonID related data.

It has drop in replacements for `InMemoryDataSource`, `InMemoryMerkleTreeStorage` and `InMemoryPrivateKeyStore`.

## Example usage

Establish a connection to the Verida network. Use the [`Private Key` authentication strategy](https://developers.verida.network/docs/client-sdk/authentication#2-private-key) for Node.js servers (ie: Issuer server) or the [Verida Connect SDK](https://developers.verida.network/docs/single-sign-on-sdk) strategy for web-browsers.

This will give you a `context` object that can be used to create encrypted, self-sovereign databases.

```
import { VeridaMerkleTreeStorage, VeridaPrivateKeyStore, VeridaDataSourceFactory } from '@verida/polygonid-storage'

// Create data storage
const dataStorage = {
    credential: new CredentialStorage(
        await VeridaDataSourceFactory<Type>(context, "polygonid_credentials")
    ),
    identity: new IdentityStorage(
        await VeridaDataSourceFactory<Type>(context, "polygonid_identity")
        await VeridaDataSourceFactory<Type>(context, "polygonid_profile")
    ),
    // @todo
    mt: new VeridaMerkleTreeStorage(40, await VeridaDataSourceFactory<Type>(context, "polygonid_merkletree")),
    states: new EthStateStorage(conf),
};

// Create private key store
const privateKeyStoreDatabase = await context.openDatabase(
    "polygonid_keystore"
);
const keyStore = new VeridaPrivateKeyStore(privateKeyStoreDatabase);
```