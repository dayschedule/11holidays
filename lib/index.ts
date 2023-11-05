import Api from "./api";
import Holidays from "./holidays";
import Countries from "./countries";

class DaySchedule {
  private api: Api;

  public holidays: Holidays;
  public countries: Countries;

  constructor(apiKey: string) {
    this.api = new Api(apiKey);
    this.holidays = new Holidays(this.api);
    this.countries = new Countries(this.api);
  }
}

export default DaySchedule;
