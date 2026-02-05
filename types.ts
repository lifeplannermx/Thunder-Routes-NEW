export interface LocationData {
  id: string;
  originalInput: string;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUri?: string;
  placeId?: string;
}

export enum RouteStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  OPTIMIZING = 'OPTIMIZING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface RouteState {
  locations: LocationData[];
  status: RouteStatus;
  errorMessage?: string;
}
