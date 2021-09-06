import React from 'react'
import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  PlainMessage,
  PublicAccount,
  RepositoryFactoryHttp,
  TransactionService,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk'

export const SendMultisigTransaction: React.FC = () => {
  const multisigTransaction = async (): Promise<void> => {
    try {
      const nodeUrl = "https://sym-test.opening-line.jp:3001"
      const cosignatoryPrivateKey = "2F8F16D66BD2CC8774B509A1D1A57718CD6F205C04918C5A9FB91A8A2B673088"
      const multisigAccountPublicKey =
        "A8241EDA0FF5BABB607B19D5BDB9FA383166E7AEB61E7D4DDA11F3E4370E7325"
      const recipientRawAddress = "TBUKFL-3BMEXY-BDQYBV-5Y7UOW-NRM3TD-RZ4PNF-CZQ"
      const mosaicId = "091F837E059AE13C"
      if (
        nodeUrl &&
        cosignatoryPrivateKey &&
        multisigAccountPublicKey &&
        recipientRawAddress &&
        mosaicId
      ) {
        const repositoryFactory = new RepositoryFactoryHttp(nodeUrl, {
          websocketUrl: nodeUrl.replace('http', 'ws') + '/ws',
          websocketInjected: WebSocket,
        })
        const epochAdjustment = await repositoryFactory
          .getEpochAdjustment()
          .toPromise()
        const networkType = await repositoryFactory.getNetworkType().toPromise()
        const networkGenerationHash = await repositoryFactory
          .getGenerationHash()
          .toPromise()

        console.log(networkType, networkGenerationHash)

        // replace with cosignatory private key

        const cosignatoryAccount = Account.createFromPrivateKey(
          cosignatoryPrivateKey,
          networkType
        )
        console.log(cosignatoryAccount, '署名者のアカウント')
        // replace with multisig account public key

        const multisigAccount = PublicAccount.createFromPublicKey(
          multisigAccountPublicKey,
          networkType
        )
        console.log(multisigAccount, 'マルチシグのアカウント')
        // replace with recipient address

        const recipientAddress =
          Address.createFromRawAddress(recipientRawAddress)
        // replace with symbol.xym id
        const networkCurrencyMosaicId = new MosaicId(mosaicId)
        // replace with network currency divisibility
        const networkCurrencyDivisibility = 6

        const transferTransaction = TransferTransaction.create(
          Deadline.create(epochAdjustment),
          recipientAddress,
          [
            new Mosaic(
              networkCurrencyMosaicId,
              UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
            ),
          ],
          PlainMessage.create('sending 10 symbol.xym'),
          networkType
        )
        /* start block 01 */
        const aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(epochAdjustment),
          [transferTransaction.toAggregate(multisigAccount)],
          networkType,
          []
        ).setMaxFeeForAggregate(3000, 4)
        // replace with meta.networkGenerationHash (nodeUrl + '/node/info')
        const signedTransaction = cosignatoryAccount.sign(
          aggregateTransaction,
          networkGenerationHash
        )
        console.log(signedTransaction.hash)
        const hashLockTransaction = HashLockTransaction.create(
          Deadline.create(epochAdjustment),
          new Mosaic(
            networkCurrencyMosaicId,
            UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
          ),
          UInt64.fromUint(5760),
          signedTransaction,
          networkType
        ).setMaxFee(3000)
        const signedHashLockTransaction = cosignatoryAccount.sign(
          hashLockTransaction,
          networkGenerationHash
        )
        // replace with node endpoint
        const listener = repositoryFactory.createListener()
        const receiptHttp = repositoryFactory.createReceiptRepository()
        const transactionHttp = repositoryFactory.createTransactionRepository()
        const transactionService = new TransactionService(
          transactionHttp,
          receiptHttp
        )
        listener.open().then(() => {
          transactionService
            .announceHashLockAggregateBonded(
              signedHashLockTransaction,
              signedTransaction,
              listener
            )
            .subscribe(
              (x) => {
                console.log(x)
              },
              (err) => console.log(err),
              () => listener.close()
            )
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <button
      className="text-white bg-indigo-600 hover:bg-indigo-700 rounded py-2 px-3 text-sm"
      onClick={() => multisigTransaction().then()}
    >
      マルチシグトランザクション承認
    </button>
  )
}
