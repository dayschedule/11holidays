import Api from "../api";
import { Holiday } from "./types";
declare class Holidays {
    private api;
    constructor(api: Api);
    list(params?: any): Promise<Holiday[]>;
    get(id: number): Promise<Holiday>;
}
export default Holidays;
