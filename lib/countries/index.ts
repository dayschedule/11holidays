import Api from "../api";
import { Country } from "./types";

class Countries {
  private api: Api;

  constructor(api: Api) {
    this.api = api;
  }

  async list(params: any = undefined): Promise<Country[]> {
    return this.api.get(`/countries`, params);
  }

  async get(id: number): Promise<Country> {
    return this.api.get(`/countries/${id}`);
  }
}

export default Countries;
