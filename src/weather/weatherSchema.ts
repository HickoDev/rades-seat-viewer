import { z } from 'zod';

const nullableNumberArray = z.array(z.number().nullable());

export const openMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  utc_offset_seconds: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: nullableNumberArray,
    apparent_temperature: nullableNumberArray,
    cloud_cover: nullableNumberArray,
    cloud_cover_low: nullableNumberArray,
    cloud_cover_mid: nullableNumberArray,
    cloud_cover_high: nullableNumberArray,
    direct_radiation: nullableNumberArray,
    direct_normal_irradiance: nullableNumberArray,
    shortwave_radiation: nullableNumberArray,
    precipitation_probability: nullableNumberArray,
    wind_speed_10m: nullableNumberArray,
    weather_code: nullableNumberArray,
  }),
});

export type OpenMeteoResponse = z.infer<typeof openMeteoResponseSchema>;
