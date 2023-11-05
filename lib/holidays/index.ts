import Api from "../api";
import { Holiday } from "./types";

class Holidays {
  private api: Api;

  constructor(api: Api) {
    this.api = api;
  }

  async list(params: any = undefined): Promise<Holiday[]> {
    return this.api.get(`/holidays`, params);
  }

  async get(id: number): Promise<Holiday> {
    return this.api.get(`/holidays/${id}`);
  }
}

export default Holidays;
