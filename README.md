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
