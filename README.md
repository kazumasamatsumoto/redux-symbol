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

