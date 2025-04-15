declare module 'react-leaflet' {
  import * as L from 'leaflet';
  import * as React from 'react';
  
  // Basic props that all components should have
  interface BaseProps {
    className?: string;
    pane?: string;
  }

  // MapContainer props
  export interface MapContainerProps extends BaseProps {
    bounds?: L.LatLngBoundsExpression;
    boundsOptions?: L.FitBoundsOptions;
    center?: L.LatLngExpression;
    children: React.ReactNode;
    whenCreated?: (map: L.Map) => void;
    whenReady?: () => void;
    zoom?: number;
    maxZoom?: number;
    minZoom?: number;
    maxBounds?: L.LatLngBoundsExpression;
    style?: React.CSSProperties;
  }

  // TileLayer props
  export interface TileLayerProps extends BaseProps {
    url: string;
    attribution?: string;
    zIndex?: number;
    opacity?: number;
  }

  // Marker props
  export interface MarkerProps extends BaseProps {
    position: L.LatLngExpression;
    children?: React.ReactNode;
    icon?: L.Icon | L.DivIcon;
    draggable?: boolean;
    eventHandlers?: { [key: string]: Function };
  }

  // Popup props
  export interface PopupProps extends BaseProps {
    children?: React.ReactNode;
    position?: L.LatLngExpression;
    offset?: L.PointExpression;
    autoPan?: boolean;
    closeButton?: boolean;
    minWidth?: number;
    maxWidth?: number;
    maxHeight?: number;
  }

  // Export components
  export const MapContainer: React.FC<MapContainerProps>;
  export const TileLayer: React.FC<TileLayerProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Popup: React.FC<PopupProps>;
}