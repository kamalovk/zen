import { Button } from '@blueprintjs/core';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { StartProxy, StopProxy } from '../wailsjs/go/app/App';
import { EventsOn } from '../wailsjs/runtime/runtime';

import { BrowserLink } from './common/BrowserLink';
import { AppToaster } from './common/toaster';
import { useProxyState } from './context/ProxyStateContext';

const PROXY_CHANNEL = 'proxy:action';
const LINUX_PROXY_GUIDE_URL = 'https://github.com/ZenPrivacy/zen-desktop/blob/master/docs/external/linux-proxy-conf.md';

enum ProxyActionKind {
  Starting = 'starting',
  Started = 'started',
  StartError = 'startError',
  Stopping = 'stopping',
  Stopped = 'stopped',
  StopError = 'stopError',
  UnsupportedDE = 'unsupportedDE',
}

interface ProxyAction {
  kind: ProxyActionKind;
  error?: string;
}

export function StartStopButton() {
  const { t } = useTranslation();
  const { proxyState, setProxyState } = useProxyState();

  useEffect(() => {
    const cancel = EventsOn(PROXY_CHANNEL, (action: ProxyAction) => {
      switch (action.kind) {
        case ProxyActionKind.Starting:
          setProxyState('loading');
          break;
        case ProxyActionKind.Started:
          setProxyState('on');
          break;
        case ProxyActionKind.StartError:
          AppToaster.show({
            message: t('startStopButton.startError', { error: action.error }),
            intent: 'danger',
          });
          setProxyState('on'); // Still worth it to give the option to shut down in case the error is recoverable.
          break;
        case ProxyActionKind.Stopping:
          setProxyState('loading');
          break;
        case ProxyActionKind.Stopped:
          setProxyState('off');
          break;
        case ProxyActionKind.StopError:
          AppToaster.show({
            message: t('startStopButton.stopError', { error: action.error }),
            intent: 'danger',
          });
          setProxyState('off');
          break;
        case ProxyActionKind.UnsupportedDE:
          AppToaster.show({
            message: (
              <div>
                <Trans
                  i18nKey="startStopButton.unsupportedDEGuide"
                  components={{
                    'guide-link': <BrowserLink href={LINUX_PROXY_GUIDE_URL} />,
                    br: <br />,
                  }}
                />
              </div>
            ),
            intent: 'warning',
          });
          break;

        default:
          console.log('unknown proxy action', action);
      }
    });

    return cancel;
  }, [t]);

  return (
    <Button
      onClick={proxyState === 'off' ? StartProxy : StopProxy}
      fill
      intent="primary"
      className="footer"
      large
      loading={proxyState === 'loading'}
    >
      {proxyState === 'off' ? t('startStopButton.start') : t('startStopButton.stop')}
    </Button>
  );
}
