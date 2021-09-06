import React, { useState } from 'react'
import { Account, NetworkType } from 'symbol-sdk'
import copy from 'clipboard-copy'

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
