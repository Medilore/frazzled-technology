---
title: "BitcoinのBlock Headerのハッシュとマイニング"
date: 2022-05-17T00:09:00+09:00
draft: false
description: "最近InstagramがWeb3.0参入と発表して色々盛り上がってる暗号通貨界隈。Blockchainについてざっくりとしかわかっていなかったので、まずはBitcoinのマイニングが何をやっているか調べることにした。"
---

最近InstagramがWeb3.0参入と発表して色々盛り上がってる暗号通貨界隈。Blockchainについてざっくりとしかわかっていなかったので、まずはBitcoinのマイニングが何をやっているか調べることにした。~~どれぐらいやる気が続くかなぁ~~

## はじめに

Nodejs + TypeScriptで書いていきますが、他言語でも簡単に書けると思います。

また、Bitcoin Wikiの[Block_hashing_algorithm](https://en.bitcoin.it/wiki/Block_hashing_algorithm)を参考に進めていきます。PHPやPythonのサンプルコードも載っています。

では早速やってきましょ～

## 本題

bitcoinでマイニングをするには、ブロックに含まれているヘッダーのいくつかのフィールドを連結してハッシュしなきゃいけないらしい。

[Block hashing algorithm](https://en.bitcoin.it/wiki/Block_hashing_algorithm)にある通り、使うのは以下のフィールド。

| Field          | Purpose                                                       | Updated when...                                         | Size (Bytes) |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------- | ------------ |
| Version        | Block version number                                          | You upgrade the software and it specifies a new version | 4            |
| hashPrevBlock  | 256-bit hash of the previous block header                     | A new block comes in                                    | 32           |
| hashMerkleRoot | 256-bit hash based on all of the transactions in the block    | A transaction is accepted                               | 32           |
| Time           | Current block timestamp as seconds since 1970-01-01T00:00 UTC | Every few seconds                                       | 4            |
| Bits           | Current target in compact format                              | The difficulty is adjusted                              | 4            |
| Nonce          | 32-bit number (starts at 0)                                   | A hash is tried (increments)                            | 4            |

ほーん。~~よくわからん~~

で、JSON-RPC APIから帰ってくるブロックヘッダーはこんな感じ

~~~json
{
    "result": {
        "hash": "00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d",
        "confirmations": 611242,
        "height": 125552,
        "version": 1,
        "versionHex": "00000001",
        "merkleroot": "2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3",
        "time": 1305998791,
        "mediantime": 1305995943,
        "nonce": 2504433986,
        "bits": "1a44b9f2",
        "difficulty": 244112.4877743364,
        "chainwork": "0000000000000000000000000000000000000000000000006aa84fd45b2350c9",
        "nTx": 4,
        "previousblockhash": "00000000000008a3a41b85b8b29ad444def299fee21793cd8b9e567eab02cd81",
        "nextblockhash": "0000000000001c0533ea776756cb6fdedbd952d3ab8bc71de3cd3f8a44cbaf85"
    },
    "error": null,
    "id": null
}
~~~

で、[Block_hashing_algorithm](https://en.bitcoin.it/wiki/Block_hashing_algorithm)に書いてあるブロック#125552のハッシュを計算するサンプルコードはこれ

~~~python
>>> import hashlib
>>> from binascii import unhexlify, hexlify
>>> header_hex = ("01000000" +
 "81cd02ab7e569e8bcd9317e2fe99f2de44d49ab2b8851ba4a308000000000000" +
 "e320b6c2fffc8d750423db8b1eb942ae710e951ed797f7affc8892b0f1fc122b" +
 "c7f5d74d" +
 "f2b9441a" +
 "42a14695")
>>> header_bin = unhexlify(header_hex)
>>> hash = hashlib.sha256(hashlib.sha256(header_bin).digest()).digest()
>>> hexlify(hash).decode("utf-8")
'1dbd981fe6985776b644b173a4d0385ddc1aa2a829688d1e0000000000000000'
>>> hexlify(hash[::-1]).decode("utf-8")
'00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d'
~~~

値がハードコーディングされてますが、versionっぽいのが16進数のlittle-endian表記されていますね。

### little-endianって何？

little-endianは、最後のバイトから順番にデータを並べる事です。

逆に、我々が普段使っている表し方はbig-endianというらしいです。

65331という数字を16進数でバイト表記した際、
* `ff 33`になるのがbig-endian
* `33 ff`になるのがlittle-endian
  
です。と言っても、バイト配列を反転させるだけ。

~~~typescript
// <Buffer 33 ff>
const little_endian = Buffer.from("FF33", "hex").reverse();

// <Buffer ff 33>
const big_endian = Buffer.from("FF33", "hex");
~~~

特に難しいこともしてないですね。

### フィールドの値を連結する

フィールドの値をどうすればいいのかわかったので、変換してみましょう。

~~~typescript
littleEdian(str: string, size: number) {
    // 16進数の文字列をBufferへ
    const buffer = Buffer.from(str, "hex");

    // little-endian化
    const reversed = buffer.reverse();

    // 指定されたバイト長にして返す
    return Buffer.concat([reversed], size);
}

const version = this.littleEdian(block125552.versionHex, 4);
const hashPrevBlock = this.littleEdian(
    block125552.previousblockhash,
    32
);
const hashMerkleRoot = this.littleEdian(block125552.merkleroot, 32);
const time = this.littleEdian(block125552.time.toString(16), 4);
const bits = this.littleEdian(block125552.bits, 4);
const nonce = this.littleEdian(block125552.nonce.toString(16), 4);
~~~

これで値の用意が出来ました。次は何をやるか、再度[Block_hashing_algorithm](https://en.bitcoin.it/wiki/Block_hashing_algorithm)を見てみましょう。

> The header is built from the six fields described above, concatenated together as little-endian values in hex notation

> Bitcoin uses: SHA256(SHA256(Block_Header)) but you have to be careful about byte-order.

らしいです。連結してSHA256(SHA256(HEADER))しろ、という事ですね！早速やりましょう。

### フィールドの値を連結してダブルハッシュする

連結します。

~~~typescript
const headerHex = Buffer.concat([
    version,
    hashPrevBlock,
    hashMerkleRoot,
    time,
    bits,
    nonce,
]);

// 0100000081cd02ab7e569e8bcd9317e2fe99f2de44d49ab2b8851ba4a308000000000000e320b6c2fffc8d750423db8b1eb942ae710e951ed797f7affc8892b0f1fc122bc7f5d74df2b9441a42a14695
console.log(headerHex.toString("hex").match(/../g)?.join(""));
~~~

ハッシュします。

~~~typescript
const doubleHash = crypto
    .createHash("sha256")
    .update(crypto.createHash("sha256").update(headerHex).digest())
    .digest();

// 1dbd981fe6985776b644b173a4d0385ddc1aa2a829688d1e0000000000000000
console.log(doubleHash.toString("hex").match(/../g)?.join(""));
~~~

出力が`1dbd981fe6985776b644b173a4d0385ddc1aa2a829688d1e0000000000000000`となりました。

> but you have to be careful about byte-order.

とあったため、ダブルハッシュした後もlittle-endianにしなくてはいけないようです。

~~~typescript
const realBlockHash = doubleHash.reverse();

// 00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d
console.log(realBlockHash.toString("hex").match(/../g)?.join(""));
~~~

これでブロックハッシュが導き出せました。やったね！

## 終わりに
今回、bitcoinのminerがやっている事をnodejsで実装してみました。

実際のマイニングでは、nonceを0からインクリメントしていきtarget以下のハッシュ値が出るまで`nonce`, `timestamp`, `coinbase`等を変更しつつハッシュしていきます。

参考にした[Block_hashing_algorithm](https://en.bitcoin.it/wiki/Block_hashing_algorithm)が2011年, Version1のブロックを使って解説されているので、今度は新しいやつでやりたいなぁ。(今はVersion4)

~~ちなみに、これを書くのに丸2日ぐらい調べました。Bufferとか普段使わんし・・・16進数とかも全然馴染みないし・・・そもそもbitだbyteだって真面目に意識もしてなかったから中々難しかった・・・~~

EOF