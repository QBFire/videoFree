#!/bin/bash

# 测试启动脚本
# 运行所有测试任务

# 设置脚本在出现错误时立即退出
set -e

# 打印脚本开始执行的消息
echo "开始运行测试..."

echo "\n=== 运行单元测试和集成测试 ==="
npm run test

# 检查测试是否通过
if [ $? -ne 0 ]; then
  echo "测试失败！请检查错误信息。"
  exit 1
fi

echo "\n=== 生成测试覆盖率报告 ==="
npm run test:coverage

# 注意：Cypress测试需要在开发服务器运行的情况下进行
# 由于我们是模拟环境，这里可以注释掉Cypress测试
# echo "\n=== 运行Cypress端到端测试 ==="
# npm run cypress:run

echo "\n所有测试完成！"