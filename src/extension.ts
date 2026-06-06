import * as vscode from 'vscode';
import { getBalance } from './deepseekApi';
import { UsagePanel } from './usagePanel';
import { t, formatTooltip } from './i18n';

const SECRET_KEY_ID = 'deepseek-api-key';
let _updatingBalance = false;
let _lastBalance: number | null = null;

export function activate(context: vscode.ExtensionContext) {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.command = 'deepseek-usage.click';
  statusBar.show();
  context.subscriptions.push(statusBar);

  const clickCmd = vscode.commands.registerCommand('deepseek-usage.click', async () => {
    const apiKey = await context.secrets.get(SECRET_KEY_ID);
    if (!apiKey) {
      await promptForApiKey(context, statusBar);
      return;
    }

    interface ActionItem extends vscode.QuickPickItem { id: string }
    const action = await vscode.window.showQuickPick<ActionItem>([
      { label: t('qpRefresh'), id: 'refresh' },
      { label: t('qpDetails'), description: t('qpDetailsDesc'), id: 'details' },
      { label: t('qpResetKey'), id: 'reset' },
      { label: t('qpClearKey'), id: 'clear' },
    ], { placeHolder: t('qpPlaceholder') });

    if (!action) return;

    switch (action.id) {
      case 'refresh': {
        const delta = await updateStatusBar(context, statusBar);
        const msg = t('msgRefreshed');
        vscode.window.showInformationMessage(
          delta != null ? `${msg}（${delta > 0 ? '+' : ''}${delta.toFixed(2)}）` : msg
        );
        break;
      }
      case 'details':
        UsagePanel.createOrShow(context);
        break;
      case 'reset':
        await promptForApiKey(context, statusBar);
        break;
      case 'clear':
        await context.secrets.delete(SECRET_KEY_ID);
        await updateStatusBar(context, statusBar);
        vscode.window.showInformationMessage(t('msgKeyCleared'));
        break;
    }
  });
  context.subscriptions.push(clickCmd);

  // 一键刷新命令：跳过 QuickPick 菜单，直接刷新余额
  const refreshCmd = vscode.commands.registerCommand('deepseek-usage.refresh', async () => {
    const apiKey = await context.secrets.get(SECRET_KEY_ID);
    if (!apiKey) {
      await promptForApiKey(context, statusBar);
      return;
    }
    const delta = await updateStatusBar(context, statusBar);
    const msg = t('msgRefreshed');
    vscode.window.showInformationMessage(
      delta != null ? `${msg}（${delta > 0 ? '+' : ''}${delta.toFixed(2)}）` : msg
    );
  });
  context.subscriptions.push(refreshCmd);

  updateStatusBar(context, statusBar);
  const timer = setInterval(() => updateStatusBar(context, statusBar), 5 * 60 * 1000);
  context.subscriptions.push({ dispose: () => clearInterval(timer) });
}

async function promptForApiKey(context: vscode.ExtensionContext, statusBar: vscode.StatusBarItem) {
  const apiKey = await vscode.window.showInputBox({
    title: t('inputTitle'),
    prompt: t('inputPrompt'),
    password: true,
    placeHolder: t('inputPlaceholder'),
    ignoreFocusOut: true,
    validateInput: (value: string) => (value?.trim() ? null : t('inputValidation')),
  });

  if (!apiKey) return;

  await context.secrets.store(SECRET_KEY_ID, apiKey.trim());
  await updateStatusBar(context, statusBar);
  vscode.window.showInformationMessage(t('msgKeySaved'));
}

async function updateStatusBar(context: vscode.ExtensionContext, statusBar: vscode.StatusBarItem): Promise<number | null> {
  if (_updatingBalance) return null;
  _updatingBalance = true;
  const oldBalance = _lastBalance;
  let newTotal: number | null = null;
  try {
    const apiKey = await context.secrets.get(SECRET_KEY_ID);

    if (!apiKey) {
      statusBar.text = `$(key) ${t('statusNotLoggedIn')}`;
      statusBar.tooltip = t('statusClickToLogin');
      return null;
    }

    const balance = await getBalance(apiKey);

    if (balance.is_available && balance.balance_infos.length > 0) {
      const info = balance.balance_infos[0];
      const total = parseFloat(info.total_balance);
      newTotal = total;
      _lastBalance = total;

      statusBar.text = `$(graph) DeepSeek: ¥${total.toFixed(2)}`;
      statusBar.tooltip = formatTooltip(
        info.total_balance,
        info.topped_up_balance,
        info.granted_balance,
        balance.is_available
      );
    } else {
      statusBar.text = `$(warning) ${t('statusBalanceError')}`;
      statusBar.tooltip = t('statusBalanceErrorTip');
    }
  } catch (err: any) {
    statusBar.text = `$(error) ${t('statusApiError')}`;
    statusBar.tooltip = `${t('statusApiErrorTip')}: ${err.message}`;
  } finally {
    _updatingBalance = false;
  }
  if (oldBalance != null && newTotal != null) {
    return newTotal - oldBalance;
  }
  return null;
}

export function deactivate() {}
