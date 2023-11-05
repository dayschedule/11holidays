import Holidays from "./holidays";
import Countries from "./countries";
declare class HolidaysApi {
    private api;
    holidays: Holidays;
    countries: Countries;
    constructor(apiKey: string);
}
export default HolidaysApi;
