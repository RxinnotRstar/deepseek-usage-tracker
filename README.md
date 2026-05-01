# DeepSeek Usage Tracker

[![Version](https://img.shields.io/badge/version-0.2.0-blue)](https://marketplace.visualstudio.com/items?itemName=foreverxzhh.deepseek-usage-tracker)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**中文** | [English](#english)

---

## 中文

在 VS Code 右下角状态栏实时显示 DeepSeek API 账户余额，并提供详细的模型定价参考与可用模型信息。

### 功能

- **状态栏余额显示** — 右下角实时显示 DeepSeek 账户总余额
- **一键查看详情** — 点击打开独立面板，展示余额、充值/赠送明细
- **模型定价参考** — 内置官方最新定价表（V4-Flash / V4-Pro），含缓存命中价格与折扣信息
- **可用模型列表** — 实时查询当前账户可用的模型
- **安全存储** — API Key 通过 VS Code SecretStorage 加密存储
- **中英文双语** — 自动匹配 VS Code 界面语言

### 使用方法

1. 安装扩展后，右下角状态栏显示 `DeepSeek: 未登录`
2. 点击状态栏 → 输入你的 DeepSeek API Key
3. 自动显示余额：`DeepSeek: ¥xx.xx`
4. 再次点击可：刷新余额 / 查看详情 / 更换 Key / 清除 Key

### 获取 API Key

前往 [platform.deepseek.com](https://platform.deepseek.com) 注册并创建 API Key。

### 隐私说明

- API Key 使用 VS Code 内置加密存储，不会明文保存
- 所有请求直接发送到 DeepSeek 官方 API（`api.deepseek.com`），不经过第三方服务器
- 扩展不收集任何个人信息

---

<h2 id="english">English</h2>

Display your DeepSeek API account balance in the VS Code status bar, with detailed model pricing and available model information.

### Features

- **Status bar balance** — Shows total balance in the bottom-right corner
- **Detail panel** — Click to open a standalone panel with balance breakdown (top-up / granted)
- **Model pricing** — Built-in official pricing table (V4-Flash / V4-Pro), including cache hit prices and discounts
- **Available models** — Fetches real-time model list from the API
- **Secure storage** — API Key encrypted via VS Code SecretStorage
- **Bilingual UI** — Auto-matches VS Code display language (中文 / English)

### Usage

1. After installation, the status bar shows `DeepSeek: Not logged in`
2. Click the status bar → enter your DeepSeek API Key
3. Balance appears: `DeepSeek: ¥xx.xx`
4. Click again to: Refresh / View details / Change Key / Clear Key

### Get an API Key

Sign up at [platform.deepseek.com](https://platform.deepseek.com) and create an API Key.

### Privacy

- API Key is encrypted via VS Code's built-in SecretStorage
- All requests go directly to DeepSeek's official API (`api.deepseek.com`), no third-party servers
- This extension collects no personal data

## License

[MIT](LICENSE)
