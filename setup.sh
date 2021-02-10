#! /usr/bin/env sh

apk add --no-cache git make musl-dev go wget
cd /tmp
wget https://github.com/go-task/task/releases/download/v3.2.2/task_linux_amd64.tar.gz
tar xvf task_linux_amd64.tar.gz
mv task /usr/local/bin/
rm -f task_linux_amd64.tar.gz LICENSE *.md
