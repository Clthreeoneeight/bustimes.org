import React from "react";
import ReactDOM from "react-dom/client";

import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";

import { LngLatBounds } from "maplibre-gl";

import VehicleMarker from "./VehicleMarker";
import VehiclePopup from "./VehiclePopup";

import { useDarkMode } from "./utils";

import "maplibre-gl/dist/maplibre-gl.css";

const apiRoot = "https://bustimes.org/";

let hasHistory = false;

const stopsStyle = {
  id: "stops",
  type: "circle",
  paint: {
    "circle-color": "#fff",
    "circle-radius": 3,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#666",
    // "circle-stroke-opacity": 0.,
  },
};

const routeStyle = {
  type: "line",
  paint: {
    "line-color": "#000",
    "line-opacity": 0.5,
    "line-width": 3,
  },
};

export default function ServiceMapMap({
  vehicles,
  vehiclesList,
  closeMap,
  geometry,
  stops,
  closeButton,
  count,
}) {
  const darkMode = useDarkMode();

  const [cursor, setCursor] = React.useState();

  const onMouseEnter = React.useCallback((e) => {
    setCursor("pointer");
  }, []);

  const onMouseLeave = React.useCallback(() => {
    setCursor(null);
  }, []);

  const [clickedVehicleMarkerId, setClickedVehicleMarker] =
    React.useState(null);

  const handleVehicleMarkerClick = React.useCallback((event, id) => {
    event.originalEvent.preventDefault();
    setClickedVehicleMarker(id);
  }, []);

  const handleMapClick = React.useCallback((e) => {
    if (!e.originalEvent.defaultPrevented) {
      setClickedVehicleMarker(null);
    }
  }, []);

  const handleMapLoad = React.useCallback((event) => {
    const map = event.target;
    map.keyboard.disableRotation();
    map.touchZoomRotate.disableRotation();
  }, []);

  const clickedVehicle =
    clickedVehicleMarkerId && vehicles[clickedVehicleMarkerId];

  let popup = null;
  if (vehiclesList && vehiclesList.length === 1) {
    popup = (
      <VehiclePopup
        item={vehiclesList[0]}
        closeButton={false}
        onClose={() => {
          setClickedVehicleMarker(null);
        }}
      />
    );
  } else if (clickedVehicle) {
    popup = (
      <VehiclePopup
        item={clickedVehicle}
        onClose={() => {
          setClickedVehicleMarker(null);
        }}
      />
    );
  }

  return (
    <Map
      dragRotate={false}
      touchPitch={false}
      touchRotate={false}
      pitchWithRotate={false}
      minZoom={8}
      maxZoom={16}
      bounds={window.EXTENT}
      fitBoundsOptions={{
        padding: 50,
      }}
      cursor={cursor}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      mapStyle={
        darkMode
          ? "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
          : "https://tiles.stadiamaps.com/styles/alidade_smooth.json"
      }
      RTLTextPlugin={null}
      onClick={handleMapClick}
      onLoad={handleMapLoad}
      interactiveLayerIds={["stops"]}
    >
      <NavigationControl showCompass={false} />
      <GeolocateControl />

      {closeButton}

      {/*count ?
        <div className="maplibregl-ctrl-top-left">
          <div className="maplibregl-ctrl maplibregl-ctrl-attrib">Tracking {count}</div>
        </div> : null*/}

      {vehiclesList ? (
        vehiclesList.map((item) => {
          return (
            <VehicleMarker
              key={item.id}
              selected={item.id === clickedVehicleMarkerId}
              vehicle={item}
              onClick={handleVehicleMarkerClick}
            />
          );
        })
      ) : (
        <div className="maplibregl-ctrl">Loading</div>
      )}

      {popup}

      {geometry && (
        <Source type="geojson" data={geometry}>
          <Layer {...routeStyle} />
        </Source>
      )}

      {stops && (
        <Source type="geojson" data={stops}>
          <Layer {...stopsStyle} />
        </Source>
      )}
    </Map>
  );
}