import { IParserResponse } from "./IParserResponse";

export class JSONParser implements IParserResponse {
	public parseResponse(data: any): any {
		return JSON.parse(Buffer.concat(data).toString());
	}
}
