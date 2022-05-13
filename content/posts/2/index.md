---
title: "HugoでJS/CSSファイルをMinify, Bundleする"
date: 2022-05-14T02:33:56+09:00
draft: false
---

Hugo で最低限のブログ機能を作り、後は最適化やなーって状態です。

と言っても SSG な上、このサイトはシンプルすぎるのでやることがなかった。~~本当は Lighthouse All100 やります！！！みたいな記事にしたかったんだけどなぁ。~~

## ライブラリ達を minify する

build 時になんかやってー pipe でつなげてーとかめんどくさいので Hugo にある minify 機能を使う

```html
{{ $prismjs := resources.Get "js/prism.js" | minify | fingerprint }}
<script src="{{ $prismjs.Permalink }}"></script>
```

こんだけで minify してくれる。fingerprint はファイルキャッシュをいい感じにやってくれるやつ。いらなかったら消してね

## bundle する

なんと Hugo は bundle もできるのだ(すごい)

まず resource を定義して

```markup
{{ $prismOkaidiacss:= resources.Get "css/prism-okaidia.css" | minify | fingerprint }}
{{ $prismcss:= resources.Get "css/prism.css" | minify | fingerprint }}
{{ $modalcss := resources.Get "css/s-img-modal.css" | minify | fingerprint }}

{{ $prismjs := resources.Get "js/prism.js" | minify | fingerprint }}
{{ $modaljs := resources.Get "js/s-img-modal.js" | minify | fingerprint }}
```

resources.Concat で bundle 後、普通に読み込む

```markup
{{ $bundlecss := slice $prismOkaidiacss $prismcss $modalcss | resources.Concat "bundle.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $bundlecss.Permalink }}">

{{ $bundlejs := slice $prismjs $modaljs | resources.Concat "bundle.js" | minify | fingerprint }}
<script src="{{ $bundlejs.Permalink }}"></script>
```

これを`/layouts/headers.html`に書けばおっけー

使ってるライブラリが多いサイトだと効果大だが、このサイトは prismjs ぐらいしか使ってないので微妙でした。Lighthouse からのお叱りが減った程度。

EOF
