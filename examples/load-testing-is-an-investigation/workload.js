import http from 'k6/http';
import { check } from 'k6';

const target = __ENV.TARGET_URL || '';
if (!/^http:\/\/127\.0\.0\.1:\d{1,5}\/work$/.test(target)) {
  throw new Error('Only the local fixture URL is allowed');
}
const model = __ENV.MODEL;
if (model !== 'open' && model !== 'closed') {
  throw new Error('MODEL must be open or closed');
}

export const options = {
  scenarios: {
    experiment: model === 'open'
      ? { executor: 'constant-arrival-rate', rate: 10, timeUnit: '1s',
          duration: '4s', preAllocatedVUs: 4, maxVUs: 8, gracefulStop: '2s' }
      : { executor: 'constant-vus', vus: 1, duration: '4s', gracefulStop: '2s' },
  },
  thresholds: { checks: ['rate==1'], http_req_failed: ['rate==0'] },
};

export default function () {
  const response = http.get(target, { redirects: 0, timeout: '2s' });
  check(response, { 'fixture returned HTTP 200': result => result.status === 200 });
}
