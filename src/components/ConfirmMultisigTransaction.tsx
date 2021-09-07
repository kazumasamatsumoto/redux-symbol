import React, { useState } from 'react'
import { map, mergeMap } from 'rxjs/operators'
import {
  Account,
  Address,
  AggregateTransaction,
  CosignatureSignedTransaction,
  CosignatureTransaction,
  NetworkType,
  RepositoryFactoryHttp,
  Transaction,
  TransactionGroup,
} from 'symbol-sdk'

export const ConfirmMultisigTransaction = () => {
  // reactの使用上トランザクションの型に合わせないといけないらしくこんな感じにしてます。
  const [aggregateTransaction, setAggregateTransaction] = useState<
    Transaction[]
  >([])

  // 未承認トランザクションの一覧を取得します
  const getUnConfirmTransactionList = async () => {
    try {
      // 対象アドレス
      const rawAddress = 'TBHZV7LHG4PIM5GJS6QPFHLR47IRTP5I6USRN3Y'
      const address = Address.createFromRawAddress(rawAddress)
      const nodeUrl = 'https://sym-test.opening-line.jp:3001'
      if (nodeUrl) {
        const repositoryFactory = new RepositoryFactoryHttp(nodeUrl)
        const transactionHttp = repositoryFactory.createTransactionRepository()
        // ここのサーチクリテリアでトランザクションの対象を設定できます。
        // 確かPartialは未承認です。
        const searchCriteria = {
          group: TransactionGroup.Partial,
          address,
          pageNumber: 1,
          pageSize: 100,
        }
        // これでトランザクション一覧を獲得できました。
        const page2 = await transactionHttp.search(searchCriteria).toPromise()
        console.log('page2', page2)
        console.log('page2.data', page2.data)
        // typescript対策でキャストしてます。
        setAggregateTransaction(page2.data as Transaction[])
        return page2.data
      }
    } catch (error) {
      console.log(error)
    }
  }

  const cosignAggregateBondedTransaction = (
    transaction: AggregateTransaction,
    account: Account
  ): CosignatureSignedTransaction => {
    const cosignatureTransaction = CosignatureTransaction.create(transaction)
    return account.signCosignatureTransaction(cosignatureTransaction)
  }

  // 未承認トランザクションの承認です
  // 未承認トランザクションの区別のためにトランザクションハッシュが必要です。
  // 要は一つずつ承認していきますといった感じですね。
  const testCosign = function (hash: string) {
    console.log('testCosign')
    // いつもの設定
    const networkType = NetworkType.TEST_NET
    // replace with private key
    const privateKey =
      '72D29CA347E87A7C4205D90BE51A800931D87402DF34A1FB5BD533BBC623E1A9'
    const account = Account.createFromPrivateKey(privateKey, networkType)
    const transactionHash = hash
    // wsに変換
    const nodeUrl = "https://sym-test.opening-line.jp:3001"
    if (nodeUrl) {
      const repositoryFactory = new RepositoryFactoryHttp(nodeUrl, {
        websocketUrl: 'ws://ngl-dual-601.testnet.symboldev.network:3000/ws',
        websocketInjected: WebSocket,
      })
      const transactionHttp = repositoryFactory.createTransactionRepository()

      // ここts-ignoreはまじでわからなかったです。
      // 承認作業
      transactionHttp
        .getTransaction(transactionHash, TransactionGroup.Partial)
        .pipe(
          // 一個しかないけどmapなのは配列で格納されているからです。
          // @ts-ignore
          map((transaction) =>
            cosignAggregateBondedTransaction(
              transaction as AggregateTransaction,
              account
            )
          ),
          mergeMap((cosignatureSignedTransaction) =>
          // @ts-ignore
            transactionHttp.announceAggregateBondedCosignature(
              cosignatureSignedTransaction
            )
          )
        )
        .subscribe(
          (announcedTransaction) => console.log(announcedTransaction),
          (err) => console.error(err)
        )
    }
  }

  return (
    <>
      <button
        className="text-white bg-indigo-600 hover:bg-indigo-700 rounded py-2 px-3 text-sm"
        onClick={getUnConfirmTransactionList}
      >
        トランザクション承認
      </button>
      <ul>
        {aggregateTransaction.map((data, index) => (
          <div key={index}>
            <p>{data.type}</p>
            <p>{data.networkType}</p>
            <p>{data.transactionInfo?.hash}</p>
            <button className="text-white bg-indigo-600 hover:bg-indigo-700 rounded py-2 px-3 text-sm"
            onClick={() => testCosign(data.transactionInfo?.hash as string)}
            >
              承認する
            </button>
          </div>
        ))}
      </ul>
    </>
  )
}
