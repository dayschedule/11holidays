import Api from "../api";
import { Country } from "./types";
declare class Countries {
    private api;
    constructor(api: Api);
    list(params?: any): Promise<Country[]>;
    get(id: number): Promise<Country>;
}
export default Countries;
