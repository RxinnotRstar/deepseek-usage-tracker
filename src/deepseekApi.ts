import * as https from 'https';

// ── 余额 ──

export interface BalanceInfo {
  currency: string;
  total_balance: string;
  granted_balance: string;
  topped_up_balance: string;
}

export interface BalanceResponse {
  is_available: boolean;
  balance_infos: BalanceInfo[];
}

// ── HTTP ──

const HOST = 'api.deepseek.com';

function fetchJson<T>(hostname: string, path: string, apiKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname,
      path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('解析响应 JSON 失败')); }
        } else {
          try {
            const parsed = JSON.parse(data);
            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
          } catch { reject(new Error(`HTTP ${res.statusCode}`)); }
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
    req.end();
  });
}

/** 查询账户余额 */
export function getBalance(apiKey: string): Promise<BalanceResponse> {
  return fetchJson<BalanceResponse>(HOST, '/user/balance', apiKey);
}

// ── 模型列表 ──

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}

/** 获取可用的模型列表 */
export function getModels(apiKey: string): Promise<ModelsResponse> {
  return fetchJson<ModelsResponse>(HOST, '/models', apiKey);
}
