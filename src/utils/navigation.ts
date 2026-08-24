// expo-router's router.back() throws/logs a "GO_BACK not handled" warning when
// there's no screen to go back to — e.g. a screen opened directly by URL/deep
// link rather than pushed from within the app. Every back/close button should
// go through this instead of calling router.back() directly.
import { router } from 'expo-router';

export function safeBack(fallbackHref: string) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref as any);
  }
}
