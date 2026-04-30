export async function getAutomationSignals() {
  if (typeof window === 'undefined') return {};

  const signals = {
    navigator_webdriver: navigator.webdriver,
    headless_chrome_indicators: [] as string[],
    automation_globals_detected: [] as string[],
    function_tostring_modified: false,
    playwright_indicators: [] as string[],
    puppeteer_indicators: [] as string[],
    selenium_indicators: [] as string[]
  };

  // Headless indicators
  if (navigator.plugins.length === 0) signals.headless_chrome_indicators.push('no_plugins');
  if (navigator.languages.length === 0) signals.headless_chrome_indicators.push('no_languages');
  if (!(window as any).chrome) signals.headless_chrome_indicators.push('missing_chrome_runtime');

  // Automation Globals
  const commonAutomationProps = [
    '__nightmare', '_phantom', 'callPhantom', '__webdriver_script_fn',
    '__playwright', '__puppeteer', '_selenium', 'domAutomation',
    'domAutomationController'
  ];

  commonAutomationProps.forEach(prop => {
    if ((window as any)[prop]) signals.automation_globals_detected.push(prop);
  });

  // Chromedriver specific leaks
  for (const key in window) {
    if (key.match(/\$cdc_asdjflasutopfhvcZLmcfl_/)) signals.selenium_indicators.push('cdc_leak');
    if (key.match(/\$chrome_asyncScriptInfo/)) signals.selenium_indicators.push('async_script_info_leak');
  }

  // Playwright/Puppeteer markers
  if ((document as any).__playwright) signals.playwright_indicators.push('document_marker');
  if ((window as any).__playwright) signals.playwright_indicators.push('window_marker');

  // toString integrity check
  try {
    const check = Function.prototype.toString.toString();
    if (!check.includes('[native code]')) signals.function_tostring_modified = true;
  } catch {
    signals.function_tostring_modified = true;
  }

  return signals;
}
