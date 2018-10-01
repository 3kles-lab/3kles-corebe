import * as fs from 'fs';
export class FileUtil {
	public static fetchXML(file: any, resp?: any): string {
		const fetchXml = fs.readFileSync(file).toString().replace('%1', resp);
		const encodedFetchXML = encodeURI(fetchXml);
		return encodedFetchXML;
	}

	public static readFile(file: any): string {
		if (file) {
			return fs.readFileSync(file).toString();
		}
		return '';
	}
}
