import { IParserResponse } from "./IParserResponse";

export class BufferParser implements IParserResponse {
	public parseResponse(data: any): any {
		return Buffer.concat(data).toString();
	}
}
