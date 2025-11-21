/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Sensor-related types for Flask backend
 */
export interface Sensor {
  sensor_id: number;
  sensor_name: string;
  location: string;
  installed_at: string;
  active: boolean;
}

export interface MoistureRecord {
  sensor_id: number;
  moisture: number;
  state: string;
  timestamp: string;
}

/**
 * API Request/Response types
 */
export interface AddSensorRequest {
  sensor_id: number;
  sensor_name: string;
  location?: string;
}

export interface AddSensorResponse {
  status: string;
}

export interface UpdateSensorRequest {
  sensor_name?: string;
  location?: string;
  active?: boolean;
}

export interface UpdateSensorResponse {
  status: string;
}

export interface SensorDataRequest {
  sensor_id: number;
  moisture: number;
}

export interface SensorDataResponse {
  status: string;
}

export interface ApiErrorResponse {
  status: string;
}
