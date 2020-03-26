# Selenium Grid

## docker-machine 初期化&起動
```
docker-machine rm default
docker-machine create default --driver virtualbox
docker-machine ls
```

##  docker-machine 起動
```
docker-machine start default
docker-machine ls
```

```
docker-machine env default
eval $(docker-machine env default)
docker-machine ls
```

## selenium-hub 起動
```
docker run -d -p 4444:4444 --name selenium-hub selenium/hub:3.141.59
```

## selenium-hub chrome 登録
```
docker run -d --link selenium-hub:hub selenium/node-chrome:3.141.59
```

## ブラウザで hub
```
docker-machine ls
open http://192.168.99.103:4444/grid/console
```

# 参考
Dockerを使って素早くSelenium Grid環境を構築しよう
https://blog.htmlhifive.com/2015/11/13/docker-selenium-grid/