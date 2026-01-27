import type { Coordinates } from './geolocation'

export interface WeatherData {
  temperature: number // Celsius
  windSpeed: number // km/h
  windDirection: number // degrees
  pressure: number // hPa
  humidity: number // %
  description: string // Clear, Cloudy, Rain, etc.
  icon: string // Weather icon emoji
}

/**
 * Get weather data for specific coordinates and time
 * Uses Open-Meteo API (free, no API key needed!)
 * @param coordinates - GPS coordinates
 * @param date - Date/time for historical weather (optional, defaults to now)
 * @returns Weather data or null
 */
export async function getWeatherData(
  coordinates: Coordinates,
  date?: Date
): Promise<WeatherData | null> {
  try {
    const targetDate = date || new Date()
    const dateStr = targetDate.toISOString().split('T')[0]
    
    // Open-Meteo API (completely free!)
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.append('latitude', coordinates.lat.toString())
    url.searchParams.append('longitude', coordinates.lng.toString())
    url.searchParams.append('hourly', 'temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code')
    url.searchParams.append('timezone', 'auto')
    url.searchParams.append('start_date', dateStr)
    url.searchParams.append('end_date', dateStr)

    const response = await fetch(url.toString())
    if (!response.ok) return null

    const data = await response.json()
    
    // Get the closest hour
    const targetHour = targetDate.getHours()
    const hourlyData = data.hourly
    
    if (!hourlyData || !hourlyData.time) return null

    // Find closest time index
    const timeIndex = hourlyData.time.findIndex((t: string) => {
      const hour = new Date(t).getHours()
      return hour === targetHour
    })

    if (timeIndex === -1) return null

    const weatherCode = hourlyData.weather_code[timeIndex]
    const { description, icon } = getWeatherDescription(weatherCode)

    return {
      temperature: Math.round(hourlyData.temperature_2m[timeIndex]),
      windSpeed: Math.round(hourlyData.wind_speed_10m[timeIndex]),
      windDirection: Math.round(hourlyData.wind_direction_10m[timeIndex]),
      pressure: Math.round(hourlyData.pressure_msl[timeIndex]),
      humidity: Math.round(hourlyData.relative_humidity_2m[timeIndex]),
      description,
      icon,
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return null
  }
}

/**
 * Get current weather for coordinates
 * @param coordinates - GPS coordinates
 * @returns Current weather data
 */
export async function getCurrentWeather(
  coordinates: Coordinates
): Promise<WeatherData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.append('latitude', coordinates.lat.toString())
    url.searchParams.append('longitude', coordinates.lng.toString())
    url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code')

    const response = await fetch(url.toString())
    if (!response.ok) return null

    const data = await response.json()
    const current = data.current

    if (!current) return null

    const { description, icon } = getWeatherDescription(current.weather_code)

    return {
      temperature: Math.round(current.temperature_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: Math.round(current.wind_direction_10m),
      pressure: Math.round(current.pressure_msl),
      humidity: Math.round(current.relative_humidity_2m),
      description,
      icon,
    }
  } catch (error) {
    console.error('Error fetching current weather:', error)
    return null
  }
}

/**
 * Convert WMO weather code to description and icon
 * Based on: https://open-meteo.com/en/docs
 */
function getWeatherDescription(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Klar', icon: '☀️' }
  if (code === 1) return { description: 'Überwiegend klar', icon: '🌤️' }
  if (code === 2) return { description: 'Teilweise bewölkt', icon: '⛅' }
  if (code === 3) return { description: 'Bewölkt', icon: '☁️' }
  if (code === 45 || code === 48) return { description: 'Nebel', icon: '🌫️' }
  if (code === 51 || code === 53 || code === 55) return { description: 'Nieselregen', icon: '🌦️' }
  if (code === 56 || code === 57) return { description: 'Gefrierender Nieselregen', icon: '🌧️' }
  if (code === 61 || code === 63 || code === 65) return { description: 'Regen', icon: '🌧️' }
  if (code === 66 || code === 67) return { description: 'Gefrierender Regen', icon: '🌧️' }
  if (code === 71 || code === 73 || code === 75) return { description: 'Schneefall', icon: '🌨️' }
  if (code === 77) return { description: 'Schneegriesel', icon: '🌨️' }
  if (code === 80 || code === 81 || code === 82) return { description: 'Regenschauer', icon: '🌧️' }
  if (code === 85 || code === 86) return { description: 'Schneeschauer', icon: '🌨️' }
  if (code === 95) return { description: 'Gewitter', icon: '⛈️' }
  if (code === 96 || code === 99) return { description: 'Gewitter mit Hagel', icon: '⛈️' }
  
  return { description: 'Unbekannt', icon: '🌡️' }
}

/**
 * Get wind direction as compass direction
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW']
  const index = Math.round(((degrees % 360) / 45)) % 8
  return directions[index]
}

/**
 * Format weather data for display
 */
export function formatWeatherSummary(weather: WeatherData): string {
  return `${weather.icon} ${weather.temperature}°C, ${weather.description}, Wind ${weather.windSpeed} km/h`
}
