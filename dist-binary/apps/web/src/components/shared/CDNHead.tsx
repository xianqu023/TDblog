import { getCDNConfig, getDNSPrefetchUrls } from '@/lib/cdn';

/**
 * CDN Head 组件
 * 在 HTML Head 中添加 CDN 相关的 DNS 预解析和 Preconnect
 */
export function CDNHead() {
  const config = getCDNConfig();

  if (!config.enabled || !config.preconnect) {
    return null;
  }

  const urls = getDNSPrefetchUrls();

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      {urls.map((url) => (
        <link key={url} rel="dns-prefetch" href={url} />
      ))}
      {urls.map((url) => (
        <link key={`preconnect-${url}`} rel="preconnect" href={url} crossOrigin="anonymous" />
      ))}
    </>
  );
}
