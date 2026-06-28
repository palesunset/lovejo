/** Android WebView / Chrome — GPU + image decode during CSS 3D flips is much slower than iOS. */
export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Android/i.test(navigator.userAgent);
}
