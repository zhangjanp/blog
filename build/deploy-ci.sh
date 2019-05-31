#!/usr/bin/env sh

# 终止一个错误
set -e


if [ "$ROT_TOKEN" = "" ]; then
  echo "Bye~"
  exit 0
fi

git clone https://$ROT_TOKEN@github.com/zhangjanp/zhangjanp.github.io.git && cd zhangjanp.github.io

# 构建
npm run docs:build

# 进入生成的构建文件夹
cd docs/.vuepress/dist

# 如果你是要部署到自定义域名
# echo 'www.example.com' > CNAME

git add -A
git commit -m 'deploy'

git push -f origin master

cd -

echo "DONE, Bye~"
exit 0