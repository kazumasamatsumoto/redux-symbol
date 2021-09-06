# ひとまずインストール関係ですが

reactのプロジェクトを作成します。

色々プロジェクトの作成方法は人によって異なるので、僕はこんな感じでやってますよ！

という感じを説明します。

まず、僕はからのディレクトリを作成します

``` terminal
mkdir sample
```

でそのからのフォルダに移動してから

``` terminal
npx create-react-app --template redux-typescript .
```

と入力します。

このコマンドでreduxとtypescriptを仕様したreactのアプリケーションが使用できます

そしてsymbol-sdkをinstallしていきます。

``` terminal
npm install symbol-sdk rxjs
```

ローカル環境での起動は

``` terminal
yarn start
```

``` terminal
npm start
```

どちらでも起動します。

重要なのはスタートコマンドでローカル環境が起動して色々表示されるということです。

これからちょっとずつreactの機能を使いながらsymbok-sdkを使用したアプリケーションを作っていこうと思います
（結構忙しかったりするので、進捗はかめですが、よろしくお願いします。

一応目標としてはredux-toolkitを使用した状態管理とsymbolの非同期処理管理やreact-queryを使用したキャッシュデータ保存など
基本的にはtypescriptを使用できればトラブルなくできるはずなので、
その辺りを目標にしていきたいと思います。

デザイン系はtailwindcssを使ってますが、
なんかいいなぁと思っているだけなので、その辺は好きなもの使うのがいいかと思います。

## AccountCreateについて

このページではアカウントの作成について色々実装しました。
React開発では状態のことをステートというらしいのですが、
大きい規模の開発になるとこのステートをたくさん管理しないといけないのでRedux-Toolkitを
使用して一箇所に固めるみたいです。

ただ今のmainブランチでは各ページにステート管理する感じにしてます。
いわば「レガシー」ってやつらしいです。

基本的にそんなに詳しくないので
こんな感じで書いたら動いた！！
的なノリでお願いします。

``` AccountCreate.tsx
<!-- reactと状態管理のインポート -->
import React, { useState } from 'react'
<!-- symbol-sdk関連 -->
import { Account, NetworkType } from 'symbol-sdk'
<!-- これはコピペ機能用 -->
import copy from 'clipboard-copy'

<!-- ここの部分ですがES7 React/Redux/GraphQL/React-Native snippetsを（vscodeのみ）を入れているとファイルを作成してrafcと入力してエンターを押すといい感じにしてくれます -->
export const AccountCreate: React.FC = () => {
  <!-- 今回管理する状態はプライベートキーとコピーしたかどうかのステート -->
  const [accountPrivateKey, setAccountPrivateKey] = useState('')
  const [copyState, setCopyState] = useState(false)

  const accountGenerate = () => {
    const account = Account.generateNewAccount(NetworkType.TEST_NET)
    console.log(account.privateKey)
    setAccountPrivateKey(account.privateKey)
  }

  // クリップボードにコピー
  const copyResults = async () => {
    await copy(accountPrivateKey)
    console.log('copied!')
    setCopyState(!copyState)
  }

  if (!accountPrivateKey)
    return (
      <div>
        <button
          className="text-white bg-indigo-600 hover:bg-indigo-700 rounded py-2 px-3 text-sm"
          onClick={accountGenerate}
        >
          アカウントを作成してデスクトップウォレットで復元しよう！！
        </button>
      </div>
    )
  if (accountPrivateKey)
    return (
      <div>
        <p>秘密鍵</p>
        <p>{accountPrivateKey}</p>
        <button
          className="text-white bg-indigo-600 hover:bg-indigo-700 rounded py-2 px-3 text-sm"
          onClick={copyResults}
        >
          コピーする
        </button>
        {copyState && (
          <div>コピーできたよ！！</div>
        )}
      </div>
    )
  return <></>
}

```

## SendTransaction.tsxについて

現在このファイルはトランザクションの送信を実施しています。
このような非同期処理は本来Redux-ToolkitのcreateAsyncThunkを使用して
成功した時、失敗した時、実施中というステータスで変化を加えることができます。
それについてはRedux-Toolkitの回で説明しようと思います。

なのでこれも同様に「レガシー」というやつです。
ソースコードには

``` SendTransaction.tsx
const rawAddress = 'TBUKFL3BMEXYBDQYBV5Y7UOWNRM3TDRZ4PNFCZQ'
const privateKey = '72D29CA347E87A7C4205D90BE51A800931D87402DF34A1FB5BD533BBC623E1A9'
```

とありますが、これは僕が持っているテストネットのアカウントです。

## SendMultisigTransaction.tsx

こちらアカウントの秘密鍵とかガッツリ書いていますが、
これは3StepWalletでの実証実験用のアカウントです。

皆さんが実施するにあたって必要なのは

``` SendMultisigTransaction.tsx
const cosignatoryPrivateKey = "2F8F16D66BD2CC8774B509A1D1A57718CD6F205C04918C5A9FB91A8A2B673088"
const multisigAccountPublicKey = "A8241EDA0FF5BABB607B19D5BDB9FA383166E7AEB61E7D4DDA11F3E4370E7325"
const recipientRawAddress = "TBUKFL-3BMEXY-BDQYBV-5Y7UOW-NRM3TD-RZ4PNF-CZQ"
```

この部分についてです。
まずはアカウントをマルチシグにするために
マルチシグ用のアカウント１つ
承認用のアカウント２つ
送付先用のアカウント１つをご準備ください

ここでは2of2の承認でトランザクションが承認される形になります。

であとはトランザクション承認用の一つのアカウントの秘密鍵を
cosignatoryPrivateKeyへ
マルチシグの公開鍵を
multisigAccountPublicKeyへ
送付先用のアドレスを
recipientRawAddressへ

設定するとマルチシグトランザクションはできます。
なのであとはPCのウォレットを使って承認作業を実施すればOKです。

## ConfirmMultisigTransaction.tsx

さて先ほど作成したマルチシグトランザクションを今度は承認します

さっきの流れで行きますと
複数人承認で先ほどの２つ作ったアカウントのもう一つの方を使っていきます。

この部分に皆さんで作成したマルチシグのもう一つの承認者のアカウントのプライベートキーを
入れてあげます。

``` ConfirmMultisigTransaction.tsx
const privateKey =
      '72D29CA347E87A7C4205D90BE51A800931D87402DF34A1FB5BD533BBC623E1A9'
```

そうすると承認がされます。

といった感じで基本的なレガシーの書き方はこんな感じになるのではないかな？とは思います

## 注意点

注意点としてはレガシーなコードが悪いとか、

ソースコードが汚いとか、

相手を傷つけるコメントを残すエンジニアは確かに多いです。

そしてどうしてもこういうの作ったで！！

というと攻撃してくる人はこの業界に多数いますが、気にせず楽しい開発をしましょう！

Happy Hacking!!
