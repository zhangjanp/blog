#!/usr/bin/env sh

# 终止一个错误
set -e


if [ "$ROT_TOKEN" = "" ]; then
  echo "Bye~"
  exit 0
fi
git clone https://$ROT_TOKEN@github.com/zhangjanp/blog.git "blog" && cd blog

# 构建
npm run docs:build

# 进入生成的构建文件夹
cd docs/.vuepress/dist

git init
git checkout -b gh-pages
git remote add origin https://$ROT_TOKEN@github.com/zhangjanp/blog.git

# 如果你是要部署到自定义域名
# echo 'www.example.com' > CNAME

git add -A
git commit -m 'deploy'

git push -f origin gh-pages

cd -

echo "DONE, Bye~"
exit 0