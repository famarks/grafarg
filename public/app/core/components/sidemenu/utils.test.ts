import { updateConfig } from '../../config';
import { getForcedLoginUrl } from './utils';

describe('getForcedLoginUrl', () => {
  it.each`
    appSubUrl          | url                    | expected
    ${''}              | ${'/whatever?a=1&b=2'} | ${'/whatever?a=1&b=2&forceLogin=true'}
    ${'/grafarg'}      | ${'/whatever?a=1&b=2'} | ${'/grafarg/whatever?a=1&b=2&forceLogin=true'}
    ${'/grafarg/test'} | ${'/whatever?a=1&b=2'} | ${'/grafarg/test/whatever?a=1&b=2&forceLogin=true'}
    ${'/grafarg'}      | ${''}                  | ${'/grafarg?forceLogin=true'}
    ${'/grafarg'}      | ${'/whatever'}         | ${'/grafarg/whatever?forceLogin=true'}
    ${'/grafarg'}      | ${'/whatever/'}        | ${'/grafarg/whatever/?forceLogin=true'}
  `(
    "when appUrl set to '$appUrl' and appSubUrl set to '$appSubUrl' then result should be '$expected'",
    ({ appSubUrl, url, expected }) => {
      updateConfig({
        appSubUrl,
      });

      const result = getForcedLoginUrl(url);

      expect(result).toBe(expected);
    }
  );
});
