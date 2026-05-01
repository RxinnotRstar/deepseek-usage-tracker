import * as vscode from 'vscode';
import { getBalance, getModels } from './deepseekApi';
import { detectLang, type Lang, t } from './i18n';

const SECRET_KEY_ID = 'deepseek-api-key';

export class UsagePanel {
  static current: UsagePanel | undefined;

  static createOrShow(context: vscode.ExtensionContext) {
    if (UsagePanel.current) {
      UsagePanel.current._panel.reveal(vscode.ViewColumn.One);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'deepseekUsage',
      t('panelTitle'),
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    UsagePanel.current = new UsagePanel(panel, context, detectLang());
  }

  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private readonly _lang: Lang;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext, lang: Lang) {
    this._panel = panel;
    this._context = context;
    this._lang = lang;
    this._panel.webview.html = this._buildHtml();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(msg => this._onMessage(msg), null, this._disposables);
    this._fetchAll();
  }

  dispose() {
    UsagePanel.current = undefined;
    this._panel.dispose();
    while (this._disposables.length) this._disposables.pop()?.dispose();
  }

  private async _onMessage(msg: any) {
    switch (msg.type) {
      case 'refresh':
        await this._fetchAll();
        break;
      case 'openUrl':
        vscode.env.openExternal(vscode.Uri.parse(msg.url));
        break;
    }
  }

  private async _fetchAll() {
    const apiKey = await this._context.secrets.get(SECRET_KEY_ID);
    if (!apiKey) {
      this._panel.webview.postMessage({ type: 'error', message: t('errorNoKey') });
      return;
    }

    try {
      const [balance, models] = await Promise.all([
        getBalance(apiKey),
        getModels(apiKey).catch(() => null),
      ]);

      this._panel.webview.postMessage({ type: 'data', balance, models });
    } catch (err: any) {
      this._panel.webview.postMessage({ type: 'error', message: `${t('fetchError')}: ${err.message}` });
    }
  }

  private _buildHtml(): string {
    // 根据语言嵌入 JS 端需要的字符串
    const ws = {
      zh: {
        balAvailable: '可用',
        balUnavailable: '不可用',
        modelDeprecated: '将弃用',
        modelsFailed: '获取失败',
      },
      en: {
        balAvailable: 'Available',
        balUnavailable: 'Unavailable',
        modelDeprecated: 'deprecating',
        modelsFailed: 'Failed to load',
      },
    }[this._lang];

    const langAttr = this._lang === 'zh' ? 'zh-CN' : 'en';
    const wsJson = JSON.stringify(ws);

    return /* html */`<!DOCTYPE html>
<html lang="${langAttr}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  color: var(--vscode-editor-foreground);
  background: var(--vscode-editor-background);
  padding: 20px;
}
.container { max-width:680px; margin:0 auto; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.header h1 { font-size:20px; font-weight:600; margin:0; }
.btn {
  background:var(--vscode-button-background); color:var(--vscode-button-foreground);
  border:none; padding:6px 14px; border-radius:4px; cursor:pointer; font-size:13px;
}
.btn:hover { background:var(--vscode-button-hoverBackground); }
.card { background:var(--vscode-textBlockQuote-background,rgba(127,127,127,.1)); border-radius:8px; padding:16px 20px; margin-bottom:16px; }
.bal-row { display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
.bal-num { font-size:32px; font-weight:700; letter-spacing:-1px; }
.bal-cur { font-size:14px; color:var(--vscode-descriptionForeground); }
.bal-sub { margin-top:8px; display:flex; gap:20px; flex-wrap:wrap; font-size:13px; color:var(--vscode-descriptionForeground); }
.bal-sub strong { color:var(--vscode-editor-foreground); }
.badge { display:inline-block; padding:2px 10px; border-radius:10px; font-size:11px; font-weight:600; }
.badge.ok { background:#1b5e2020; color:var(--vscode-testing-iconPassed,#4caf50); }
.badge.err { background:#b71c1c20; color:var(--vscode-testing-iconFailed,#f44336); }
.link { color:var(--vscode-textLink-foreground); cursor:pointer; text-decoration:underline; }
.link:hover { color:var(--vscode-textLink-activeForeground); }
.info-card { background:var(--vscode-textBlockQuote-background,rgba(127,127,127,.1)); border-radius:8px; padding:16px 20px; margin-bottom:16px; display:flex; align-items:flex-start; gap:12px; }
.info-card .icon { font-size:20px; flex-shrink:0; margin-top:1px; }
.info-card .title { font-size:13px; font-weight:600; margin-bottom:4px; }
.info-card .desc { font-size:12px; color:var(--vscode-descriptionForeground); line-height:1.6; }
.sec-title { font-size:14px; font-weight:600; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.price-table { width:100%; border-collapse:collapse; font-size:12px; }
.price-table th { text-align:left; padding:6px 8px; color:var(--vscode-descriptionForeground); font-weight:500; border-bottom:1px solid var(--vscode-textBlockQuote-background,rgba(127,127,127,.2)); }
.price-table td { padding:8px; border-bottom:1px solid var(--vscode-textBlockQuote-background,rgba(127,127,127,.1)); }
.price-table tr:last-child td { border-bottom:none; }
.price-table .price-num { font-weight:600; white-space:nowrap; }
.price-table .ori { text-decoration:line-through; opacity:.4; font-weight:400; }
.price-table .note { font-size:11px; color:var(--vscode-descriptionForeground); }
.model-label { font-weight:600; }
.model-alias { font-size:11px; color:var(--vscode-descriptionForeground); }
.model-tags { display:flex; flex-wrap:wrap; gap:6px; }
.model-tag { display:inline-block; padding:3px 10px; border-radius:4px; font-size:12px; background:var(--vscode-textBlockQuote-background,rgba(127,127,127,.15)); }
.model-tag .dep { text-decoration:line-through; opacity:.5; }
.state-msg { text-align:center; padding:40px 20px; color:var(--vscode-descriptionForeground); }
.spinner { display:inline-block; width:20px; height:20px; border:2px solid var(--vscode-textBlockQuote-background); border-top-color:var(--vscode-focusBorder); border-radius:50%; animation:spin .6s linear infinite; margin-bottom:12px; }
@keyframes spin { to{transform:rotate(360deg);} }
.hidden { display:none!important; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${t('panelTitle')}</h1>
    <button class="btn" onclick="doRefresh()">${t('refreshBtn')}</button>
  </div>
  <div id="loading" class="state-msg"><div class="spinner"></div><div>${t('loading')}</div></div>
  <div id="error" class="state-msg hidden"><div id="errMsg"></div></div>
  <div id="dashboard" class="hidden">

    <div class="card">
      <div class="bal-row">
        <span class="bal-num" id="balTotal">—</span>
        <span class="bal-cur" id="balCur">CNY</span>
        <span class="badge" id="balBadge">—</span>
      </div>
      <div class="bal-sub">
        <span>${t('balTopUpLabel')}: <strong id="balTopUp">—</strong></span>
        <span>${t('balGrantLabel')}: <strong id="balGrant">—</strong></span>
        <span>${t('balStatusLabel')}: <strong id="balStatus">—</strong></span>
      </div>
    </div>

    <div class="info-card">
      <span class="icon">📊</span>
      <div>
        <div class="title">${t('usageTitle')}</div>
        <div class="desc">${t('usageDesc1')}<br>${t('usageDesc2')}</div>
        <span class="link" onclick="openUrl('https://platform.deepseek.com/usage')">${t('usageLink')}</span>
      </div>
    </div>

    <div class="card">
      <div class="sec-title">${t('pricingTitle')}</div>
      <p style="font-size:11px;color:var(--vscode-descriptionForeground);margin-bottom:10px;">
        ${t('pricingUnit')} <span id="priceDate"></span>
      </p>
      <table class="price-table">
        <thead>
          <tr>
            <th>${t('pricingHModel')}</th>
            <th style="text-align:right">${t('pricingHInputCache')}</th>
            <th style="text-align:right">${t('pricingHInput')}</th>
            <th style="text-align:right">${t('pricingHOutput')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><div class="model-label">DeepSeek-V4-Flash</div><div class="model-alias">deepseek-v4-flash</div></td>
            <td class="price-num" style="text-align:right">¥0.02</td>
            <td class="price-num" style="text-align:right">¥1</td>
            <td class="price-num" style="text-align:right">¥2</td>
          </tr>
          <tr>
            <td>
              <div class="model-label">DeepSeek-V4-Pro</div>
              <div class="model-alias">deepseek-v4-pro</div>
              <div class="note">${t('pricingProNote')}</div>
            </td>
            <td class="price-num" style="text-align:right">¥0.025</td>
            <td class="price-num" style="text-align:right">¥3 <span class="ori">¥12</span></td>
            <td class="price-num" style="text-align:right">¥6 <span class="ori">¥24</span></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:11px;color:var(--vscode-descriptionForeground);margin-top:10px;line-height:1.5;">
        ${t('pricingFootnote')}<br>
        🔗 <span class="link" onclick="openUrl('https://api-docs.deepseek.com/zh-cn/quick_start/pricing')">${t('pricingLink')}</span>
      </p>
    </div>

    <div class="card">
      <div class="sec-title">${t('modelsTitle')}</div>
      <div id="modelTagsContainer" class="model-tags"><span style="color:var(--vscode-descriptionForeground);font-size:12px;">${t('modelsLoading')}</span></div>
    </div>

  </div>
</div>

<script>
(function(){
  var _ws = ${wsJson};
  var vscode = acquireVsCodeApi();

  window.doRefresh = function(){
    document.getElementById('loading').classList.toggle('hidden',false);
    document.getElementById('error').classList.toggle('hidden',true);
    document.getElementById('dashboard').classList.toggle('hidden',true);
    vscode.postMessage({type:'refresh'});
  };
  window.openUrl = function(url){
    vscode.postMessage({type:'openUrl',url:url});
  };

  document.getElementById('priceDate').textContent = new Date().toISOString().slice(0,10);

  window.addEventListener('message',function(event){
    var msg = event.data;
    document.getElementById('loading').classList.toggle('hidden',true);

    if(msg.type === 'error'){
      document.getElementById('error').classList.toggle('hidden',false);
      document.getElementById('dashboard').classList.toggle('hidden',true);
      document.getElementById('errMsg').textContent = msg.message;
      return;
    }

    if(msg.type === 'data'){
      document.getElementById('dashboard').classList.toggle('hidden',false);

      var b = msg.balance;
      if(b && b.balance_infos && b.balance_infos.length){
        var bi = b.balance_infos[0];
        document.getElementById('balTotal').textContent = '¥' + parseFloat(bi.total_balance).toFixed(2);
        document.getElementById('balCur').textContent = bi.currency;
        document.getElementById('balTopUp').textContent = '¥' + parseFloat(bi.topped_up_balance).toFixed(2);
        document.getElementById('balGrant').textContent = '¥' + parseFloat(bi.granted_balance).toFixed(2);
        var ok = b.is_available;
        document.getElementById('balStatus').textContent = ok ? _ws.balAvailable : _ws.balUnavailable;
        var badge = document.getElementById('balBadge');
        badge.textContent = ok ? _ws.balAvailable : _ws.balUnavailable;
        badge.className = 'badge ' + (ok ? 'ok' : 'err');
      }

      var models = msg.models;
      var container = document.getElementById('modelTagsContainer');
      if(models && models.data && models.data.length){
        var current = ['deepseek-v4-flash','deepseek-v4-pro'];
        var legacy = ['deepseek-chat','deepseek-reasoner'];
        container.innerHTML = models.data
          .filter(function(m){ return current.indexOf(m.id)>=0 || legacy.indexOf(m.id)>=0; })
          .sort(function(a,b){
            var order = current.concat(legacy);
            return order.indexOf(a.id) - order.indexOf(b.id);
          })
          .map(function(m){
            var isLegacy = legacy.indexOf(m.id)>=0;
            return '<span class="model-tag'+(isLegacy?' dep':'')+'">'
              + (isLegacy
                  ? '<span class="dep">'+esc(m.id)+'</span> ('+_ws.modelDeprecated+')'
                  : esc(m.id))
              + '</span>';
          }).join('');
      } else {
        container.innerHTML = '<span style="color:var(--vscode-descriptionForeground);font-size:12px;">'+_ws.modelsFailed+'</span>';
      }
    }
  });

  function esc(s){
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
</script>
</body>
</html>`;
  }
}
