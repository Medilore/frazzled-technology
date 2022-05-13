---
title: "Hugoで静的サイトを構築"
date: 2022-05-12T19:54:49+09:00
draft: false
---

n番煎じ

急にブログやりてーなーって衝動に駆られたので、作りました。

初めてHugo触ったので初学者向けです。たぶん。

## Hugo導入

Windows向けです。

1. [Hugo/release](https://github.com/gohugoio/hugo/releases)から対応OSのバイナリダウンロード

1. WindowsのPath通す

`hugo new MY_SITE_NAME`

でサイト生成、

`hugo server -D`

で実行。

## theme導入

[Hugo Themes](https://themes.gohugo.io/)から好きなthemeを選び、
zipでダウンロードしてきて`/themes`にぶちこんで終わり。

テーマのカスタマイズ等はサイトディレクトリの/layoutsフォルダへheader.html等を入れてthemeのファイルを上書きするらしい。



## 自分用にconfigをいじる

`/config.toml`をいじる

~~~toml
baseURL = 'https://Medilore.github.io/frazzled-technology/'
DefaultContentLanguage = "ja"
languageCode = "ja-jp"
title = 'frazzled-technology'
theme = "archie"
HasCJKLanguage = true
disableKinds = ["RSS"]
pygmentsCodeFences = false
Copyright = "frazzled-technology"

[params]
mode = "dark"
~~~

このサイトのconfigはこんな感じ。必須なのは`baseURL, title, theme`ぐらい？全てのオプションは[All Configuration Settings](https://gohugo.io/getting-started/configuration/#all-configuration-settings)にある。

## 記事をつくる

`hugo new post/HOGE.md`で記事作成。`content/post/HOGE.md`に生成される。

あとはmarkdownをガリガリ書くだけ

frontmatterをいじりたかったら`/archetypes/default.md`をいじろう。

## 公開

`hugo`コマンドを実行すれば`/public`へ公開するためのファイルが生成される。

**が、**

俺はgithub pagesで公開したかったので、ちょっと回り道をする。

### gh-pagesブランチを作成

github pagesを公開するにはgh-pagesブランチとかいうのが必要らしいので、作る

~~~bash
git checkout --orphan gh-pages
git clean -fdx && test $(git ls-files | wc -l) -eq 0 || git rm -rf .
git commit -m "initial commit"
git push origin gh-pages
~~~

これで空のgh-pagesブランチが作成されるので、ここにpublicの中身をぶちまける

~~subtree, よくわからんので後で調べる~~

~~~bash
git checkout master
git subtree add --prefix=public git@github.com:[username]/YOURSITE.git gh-pages --squash
git subtree pull --prefix=public git@github.com:[username]/YOURSITE.git gh-pages
~~~


正常にできたら`hugo`で生成、普通にcommit、pushした後

~~~bash
git subtree push --prefix=public git@github.com:[username]/YOURSITE.git gh-pages
~~~

で、おわり。

## github pagesの設定

最後の設定

ProjectページのSettingsから

<!-- ![](20220513003936.png) -->
{{<img src="20220513003936.png">}}

タブ中央のPagesへ行き、SourceのBranchをgh-pagesに、ディレクトリをrootにしてSaveする。

<!-- ![](20220513004308.png)   -->
{{<img src="20220513004308.png">}}
かんた～ん

記事更新したい時はstage, commit, pushした後buildしてsubtree pushする

めんどくせ～からバッチファイルとか作ったほうが良いかも


EOF