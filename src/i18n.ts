import * as vscode from 'vscode';

export type Lang = 'zh' | 'en';

export function detectLang(): Lang {
  return vscode.env.language.startsWith('zh') ? 'zh' : 'en';
}

type MsgMap = Record<string, string | ((lang: Lang) => string)>;

const zh: Record<string, string> = {
  // ── Status bar ──
  'statusNotLoggedIn': 'DeepSeek: 未登录',
  'statusClickToLogin': '点击登录 DeepSeek API',
  'statusBalance': '总余额',
  'statusTopUp': '充值余额',
  'statusGrant': '赠送余额',
  'statusAccountState': '账户状态',
  'statusNormal': '正常',
  'statusUnavailable': '不可用',
  'statusClickHint': '点击查看详情或刷新',
  'statusBalanceError': 'DeepSeek: 余额异常',
  'statusBalanceErrorTip': '无法获取余额信息',
  'statusApiError': 'DeepSeek: 获取失败',
  'statusApiErrorTip': '错误',

  // ── QuickPick ──
  'qpRefresh': '$(sync) 刷新余额',
  'qpDetails': '$(file-text) 查看详情',
  'qpDetailsDesc': '打开详情面板',
  'qpResetKey': '$(key) 重新设置 API Key',
  'qpClearKey': '$(sign-out) 清除 API Key',
  'qpPlaceholder': 'DeepSeek 余额追踪 — 选择操作',

  // ── Input box ──
  'inputTitle': 'DeepSeek API Key',
  'inputPrompt': '输入你的 DeepSeek API Key（可在 platform.deepseek.com 获取）',
  'inputPlaceholder': 'sk-...',
  'inputValidation': 'API Key 不能为空',

  // ── Info messages ──
  'msgRefreshed': 'DeepSeek 余额已刷新',
  'msgKeySaved': 'DeepSeek API Key 已保存',
  'msgKeyCleared': 'DeepSeek API Key 已清除',

  // ── Panel ──
  'panelTitle': 'DeepSeek 详情',
  'refreshBtn': '↻ 刷新',
  'loading': '正在获取数据…',
  'errorNoKey': '未设置 API Key，请先在状态栏点击登录',
  'errorFetch': '获取数据失败',
  'fetchError': '获取数据失败',
  'balTopUpLabel': '充值',
  'balGrantLabel': '赠送',
  'balStatusLabel': '状态',
  'balAvailable': '可用',
  'balUnavailable': '不可用',
  'usageTitle': '用量数据',
  'usageDesc1': 'DeepSeek 不提供用量查询 API，无法在此显示详细用量。',
  'usageDesc2': '请前往 DeepSeek 控制台查看。',
  'usageLink': '→ 打开 platform.deepseek.com/usage',
  'pricingTitle': '💰 模型定价',
  'pricingUnit': '单位：¥ / 百万 tokens · 数据更新于',
  'pricingHModel': '模型',
  'pricingHInputCache': '输入（缓存命中）',
  'pricingHInput': '输入',
  'pricingHOutput': '输出',
  'pricingProNote': '当前 2.5 折，截至 2026-05-31',
  'pricingFootnote': '💡 deepseek-chat → v4-flash 非思考模式 · deepseek-reasoner → v4-flash 思考模式（将弃用）',
  'pricingLink': '查看官方定价页面 →',
  'modelsTitle': '🧠 可用模型',
  'modelsLoading': '加载中…',
  'modelsFailed': '获取失败',
  'modelDeprecated': '将弃用',
};

const en: Record<string, string> = {
  // ── Status bar ──
  'statusNotLoggedIn': 'DeepSeek: Not logged in',
  'statusClickToLogin': 'Click to login DeepSeek API',
  'statusBalance': 'Balance',
  'statusTopUp': 'Top-up',
  'statusGrant': 'Granted',
  'statusAccountState': 'Status',
  'statusNormal': 'Normal',
  'statusUnavailable': 'Unavailable',
  'statusClickHint': 'Click to view details or refresh',
  'statusBalanceError': 'DeepSeek: Balance error',
  'statusBalanceErrorTip': 'Unable to fetch balance',
  'statusApiError': 'DeepSeek: Fetch failed',
  'statusApiErrorTip': 'Error',

  // ── QuickPick ──
  'qpRefresh': '$(sync) Refresh balance',
  'qpDetails': '$(file-text) View details',
  'qpDetailsDesc': 'Open detail panel',
  'qpResetKey': '$(key) Reset API Key',
  'qpClearKey': '$(sign-out) Clear API Key',
  'qpPlaceholder': 'DeepSeek Tracker — Choose action',

  // ── Input box ──
  'inputTitle': 'DeepSeek API Key',
  'inputPrompt': 'Enter your DeepSeek API Key (get it from platform.deepseek.com)',
  'inputPlaceholder': 'sk-...',
  'inputValidation': 'API Key cannot be empty',

  // ── Info messages ──
  'msgRefreshed': 'DeepSeek balance refreshed',
  'msgKeySaved': 'DeepSeek API Key saved',
  'msgKeyCleared': 'DeepSeek API Key cleared',

  // ── Panel ──
  'panelTitle': 'DeepSeek Details',
  'refreshBtn': '↻ Refresh',
  'loading': 'Fetching data…',
  'errorNoKey': 'API Key not set. Please login from the status bar.',
  'errorFetch': 'Failed to fetch data',
  'fetchError': 'Failed to fetch data',
  'balTopUpLabel': 'Top-up',
  'balGrantLabel': 'Granted',
  'balStatusLabel': 'Status',
  'balAvailable': 'Available',
  'balUnavailable': 'Unavailable',
  'usageTitle': 'Usage Data',
  'usageDesc1': 'DeepSeek does not provide a usage query API.',
  'usageDesc2': 'Please visit the DeepSeek console to view usage.',
  'usageLink': '→ Open platform.deepseek.com/usage',
  'pricingTitle': '💰 Model Pricing',
  'pricingUnit': 'Unit: ¥ / 1M tokens · Updated',
  'pricingHModel': 'Model',
  'pricingHInputCache': 'Input (cache hit)',
  'pricingHInput': 'Input',
  'pricingHOutput': 'Output',
  'pricingProNote': '2.5× discount, until 2026-05-31',
  'pricingFootnote': '💡 deepseek-chat → v4-flash non-thinking · deepseek-reasoner → v4-flash thinking (deprecating)',
  'pricingLink': 'View official pricing →',
  'modelsTitle': '🧠 Available Models',
  'modelsLoading': 'Loading…',
  'modelsFailed': 'Failed to load',
  'modelDeprecated': 'deprecating',
};

const messages: Record<Lang, Record<string, string>> = { zh, en };
let _cachedLang: Lang | null = null;

export function t(key: string): string {
  if (!_cachedLang) _cachedLang = detectLang();
  return messages[_cachedLang]?.[key] ?? zh[key] ?? key;
}

/** 带插值的翻译：{0} {1} ... */
export function tf(key: string, ...args: string[]): string {
  let msg = t(key);
  args.forEach((a, i) => { msg = msg.replace(`{${i}}`, a); });
  return msg;
}

export function formatTooltip(
  balance: string,
  topUp: string,
  granted: string,
  available: boolean
): string {
  const ok = available ? t('balAvailable') : t('balUnavailable');
  return [
    `${t('statusBalance')}: ¥${balance}`,
    `${t('statusTopUp')}: ¥${topUp}`,
    `${t('statusGrant')}: ¥${granted}`,
    `${t('statusAccountState')}: ${ok}`,
    t('statusClickHint'),
  ].join('\n');
}
