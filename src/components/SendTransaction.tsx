import React from 'react'
import {
  Account,
  Address,
  Deadline,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} from 'symbol-sdk'

export const SendTransaction: React.FC = () => {
  const example = async (): Promise<void> => {
    // Network information
    const nodeUrl = 'http://ngl-dual-101.testnet.symboldev.network:3000'
    const repositoryFactory = new RepositoryFactoryHttp(nodeUrl)
    const epochAdjustment = await repositoryFactory
      .getEpochAdjustment()
      .toPromise()
    const networkType = await repositoryFactory.getNetworkType().toPromise()
    const networkGenerationHash = await repositoryFactory
      .getGenerationHash()
      .toPromise()
    // Returns the network main currency, symbol.xym
    const { currency } = await repositoryFactory.getCurrencies().toPromise()

    /* start block 01 */
    // replace with recipient address
    // TODO: ここのアドレスは好きなアドレスに変換してね
    const rawAddress = 'TBUKFL3BMEXYBDQYBV5Y7UOWNRM3TDRZ4PNFCZQ'
    const recipientAddress = Address.createFromRawAddress(rawAddress)

    const transferTransaction = TransferTransaction.create(
      Deadline.create(epochAdjustment),
      recipientAddress,
      [currency.createRelative(10)],
      PlainMessage.create('This is a test message'),
      networkType,
      UInt64.fromUint(2000000)
    )
    /* end block 01 */

    /* start block 02 */
    // replace with sender private key
    // TODO: ここはプライベートキーです。あくまでもテスト用なので本番では.envで隠すなり工夫が必要です
    const privateKey =
      '72D29CA347E87A7C4205D90BE51A800931D87402DF34A1FB5BD533BBC623E1A9'
    const account = Account.createFromPrivateKey(privateKey, networkType)
    const signedTransaction = account.sign(
      transferTransaction,
      networkGenerationHash
    )
    console.log('Payload:', signedTransaction.payload)
    console.log('Transaction Hash:', signedTransaction.hash)
    /* end block 02 */

    /* start block 03 */
    const transactionRepository =
      repositoryFactory.createTransactionRepository()
    const response = await transactionRepository
      .announce(signedTransaction)
      .toPromise()
    console.log(response)
    /* end block 03 */
  }
  return (
    // reactではカーリーブラケット{}で囲うことでPromiseのような関数がうまくいった時then()のような処理もかけます
    <button
      className="text-white bg-indigo-600 hover:bg-indigo-700 rounded py-2 px-3 text-sm"
      onClick={() => example().then()}
    >
      トランザクション送信
    </button>
  )
}
