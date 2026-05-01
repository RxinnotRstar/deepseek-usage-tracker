import * as vscode from 'vscode';
import { getBalance } from './deepseekApi';
import { UsagePanel } from './usagePanel';
import { t, formatTooltip } from './i18n';

const SECRET_KEY_ID = 'deepseek-api-key';
let _updatingBalance = false;

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
      case 'refresh':
        await updateStatusBar(context, statusBar);
        vscode.window.showInformationMessage(t('msgRefreshed'));
        break;
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

async function updateStatusBar(context: vscode.ExtensionContext, statusBar: vscode.StatusBarItem) {
  if (_updatingBalance) return;
  _updatingBalance = true;
  try {
    const apiKey = await context.secrets.get(SECRET_KEY_ID);

    if (!apiKey) {
      statusBar.text = `$(key) ${t('statusNotLoggedIn')}`;
      statusBar.tooltip = t('statusClickToLogin');
      return;
    }

    const balance = await getBalance(apiKey);

    if (balance.is_available && balance.balance_infos.length > 0) {
      const info = balance.balance_infos[0];
      const total = parseFloat(info.total_balance);

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
}

export function deactivate() {}
