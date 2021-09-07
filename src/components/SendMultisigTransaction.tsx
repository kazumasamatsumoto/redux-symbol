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
      const nodeUrl = 'https://sym-test.opening-line.jp:3001'
      const cosignatoryPrivateKey =
        '2F8F16D66BD2CC8774B509A1D1A57718CD6F205C04918C5A9FB91A8A2B673088'
      const multisigAccountPublicKey =
        'A8241EDA0FF5BABB607B19D5BDB9FA383166E7AEB61E7D4DDA11F3E4370E7325'
      const recipientRawAddress =
        'TBUKFL-3BMEXY-BDQYBV-5Y7UOW-NRM3TD-RZ4PNF-CZQ'
      const mosaicId = '091F837E059AE13C'
      if (
        nodeUrl &&
        cosignatoryPrivateKey &&
        multisigAccountPublicKey &&
        recipientRawAddress &&
        mosaicId
      ) {
        // websocketUrlにしているのはlistener対策です。
        const repositoryFactory = new RepositoryFactoryHttp(nodeUrl, {
          websocketUrl: nodeUrl.replace('http', 'ws') + '/ws',
          websocketInjected: WebSocket,
        })
        // いつもの設定
        /**
         * エポックアジャストメントは理論時間（ブロック生成時間）と実際の時間をアジャストします
         * ネットワークタイプはノードのURLから算出
         * ジェネレーションハッシュもノードから算出
         */
        const epochAdjustment = await repositoryFactory
          .getEpochAdjustment()
          .toPromise()
        const networkType = await repositoryFactory.getNetworkType().toPromise()
        const networkGenerationHash = await repositoryFactory
          .getGenerationHash()
          .toPromise()

        console.log(networkType, networkGenerationHash)

        // マルチシグの申請をしたい人のアカウントの秘密鍵からアカウントを生成
        const cosignatoryAccount = Account.createFromPrivateKey(
          cosignatoryPrivateKey,
          networkType
        )
        console.log(cosignatoryAccount, '署名者のアカウント')

        // マルチシグアカウント（金庫のアカウントの公開鍵からアカウント生成）
        const multisigAccount = PublicAccount.createFromPublicKey(
          multisigAccountPublicKey,
          networkType
        )
        console.log(multisigAccount, 'マルチシグのアカウント')
        // replace with recipient address

        // 受取人のアドレスからアカウントを作成
        const recipientAddress =
          Address.createFromRawAddress(recipientRawAddress)
        // モザイク定義
        const networkCurrencyMosaicId = new MosaicId(mosaicId)
        // 可処分の決定10の６乗で設定
        const networkCurrencyDivisibility = 6

        // ここからはトランザクションの作成
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

        // トランザクションをアグリゲートトランザクションの中に入れます。
        // createBondedにしているのは2of2のためです。
        // 単独でトランザクション承認ができない場合はcreateBondedです。
        const aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(epochAdjustment),
          [transferTransaction.toAggregate(multisigAccount)],
          networkType,
          []
        ).setMaxFeeForAggregate(3000, 4)

        // トランザクションの署名です。
        // ここでは申請者のアカウントを使って署名します。
        const signedTransaction = cosignatoryAccount.sign(
          aggregateTransaction,
          networkGenerationHash
        )
        console.log(signedTransaction.hash)
        // マルチシグトランザクションでは供託金が必要になります。
        // その供託金のトランザクションです。
        // ちなみに申請が拒否されるとこの供託金は闇へと消えます。
        // バクラみたいに
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

        // 色々定義します。
        const listener = repositoryFactory.createListener()
        const receiptHttp = repositoryFactory.createReceiptRepository()
        const transactionHttp = repositoryFactory.createTransactionRepository()
        const transactionService = new TransactionService(
          transactionHttp,
          receiptHttp
        )
        // トランザクションがうまくいったからどうかによって処理を変えれます。
        listener.open().then(() => {
          transactionService
            .announceHashLockAggregateBonded(
              signedHashLockTransaction,
              signedTransaction,
              listener
            )
            .subscribe(
              (x) => {
                // ちなみにうまくいったときはここで処理を実行できます。
                // なのでDynamoDBと連携してデータをAWSに格納するタイミングとかはここでいいんちゃうかな？と思っています。
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
