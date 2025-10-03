import UAParser from 'ua-parser-js';

export function parseUserAgent(ua?: string): { device?: string } {
	try {
		const parser = new UAParser(ua || '');
		const os = parser.getOS();
		const browser = parser.getBrowser();
		const device = parser.getDevice();
		const label = [device.vendor, device.model].filter(Boolean).join(' ') || device.type || 'desktop';
		return { device: `${browser.name || ''} ${browser.version || ''} on ${os.name || ''} ${os.version || ''} (${label})`.trim() };
	} catch {
		return {};
	}
}
