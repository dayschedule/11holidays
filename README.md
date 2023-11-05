# 11holidays
Global holidays API for public holidays, bank holidays and observances from 230+ countries. 

## Holidays API
To retrieve the complete holidays list by specific country code and year

```
const instance = new HolidaysApi(API_KEY);
const holidays = await instance.holidays.list({country: 'US', year: '2023'});

console.log(holidays);

[
  {
    "holiday_id": 6093,
    "name": "New Year's Day",
    "date": "2023-01-01",
    "description": "...",
    "occasion_id": 6220,
    "country": "US",
    "type": "State Holiday",
    "created_at": "2023-10-28 15:10:10",
    "updated_at": null
  },
  {
    "holiday_id": 6094,
    "name": "New Year's Day",
    "date": "2023-01-01",
    "description": "...",
    "occasion_id": 6220,
    "country": "US",
    "type": "Federal Holiday",
    "created_at": "2023-10-28 15:10:10",
    "updated_at": null
  },
  ...
]

```

### Parameters
country (2 char) - Required. 2 character ISO country code.
year (integer) - Required. Year in 4 digit format.

## Countries API
To retrieve the complete list of countries

```
const instance = new HolidaysApi(API_KEY);
const countries = await instance.countries.list();

console.log(countries);

[
   {"country":"US","name":"United States"},
   {"country":"IN","name":"India"}
]
```