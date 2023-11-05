import HolidaApi from "./src";

const instance = new HolidaApi(`${process.env.API_KEY}`);
const holidays = await instance.holidays.list({ country: "US", year: "2023" });

console.log(holidays);
