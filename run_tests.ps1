<#
.SYNOPSIS
运行VideoFree项目的所有测试

.DESCRIPTION
此脚本用于运行项目的单元测试和集成测试

.EXAMPLE
.
un_tests.ps1
#>

# 设置执行策略以允许运行脚本
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# 输出开始信息
Write-Host "开始运行测试..." -ForegroundColor Green

# 运行单元测试和集成测试
Write-Host "`n=== 运行单元测试和集成测试 ===" -ForegroundColor Blue
npm run test

# 检查测试是否通过
if ($LASTEXITCODE -ne 0) {
    Write-Host "测试失败！请检查错误信息。" -ForegroundColor Red
    exit 1
}

# 生成测试覆盖率报告
Write-Host "`n=== 生成测试覆盖率报告 ===" -ForegroundColor Blue
npm run test:coverage

# 注意：Cypress测试需要在开发服务器运行的情况下进行
# 由于我们是模拟环境，这里可以注释掉Cypress测试
# Write-Host "`n=== 运行Cypress端到端测试 ===" -ForegroundColor Blue
# npm run cypress:run

# 输出完成信息
Write-Host "`n所有测试完成！" -ForegroundColor Green