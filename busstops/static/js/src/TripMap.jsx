import React from "react";

import Map, {
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";

import { useRoute } from "wouter";
import { navigate } from "wouter/use-location";

import { useDarkMode } from "./utils";
import { LngLatBounds } from "maplibre-gl";

import TripTimetable from "./TripTimetable";
import StopPopup from "./StopPopup";
import VehicleMarker from "./VehicleMarker";
import VehiclePopup from "./VehiclePopup";

const apiRoot = process.env.API_ROOT;

const stopsStyle = {
  id: "stops",
  type: "symbol",
  layout: {
    "icon-rotate": ["+", 45, ["get", "bearing"]],
    "icon-image": "stop",
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
    "icon-padding": 0,
  },
};

const routeStyle = {
  type: "line",
  paint: {
    "line-color": "#777",
    "line-width": 3,
  },
};

export default function TripMap() {
  const [, params] = useRoute("/trips/:id");

  const [trip, setTrip] = React.useState(window.STOPS);

  const bounds = React.useMemo(() => {
    let bounds = new LngLatBounds();
    for (let item of trip.times) {
      if (item.stop.location) {
        bounds.extend(item.stop.location);
      }
    }
    return bounds;
  }, [trip]);

  const navigateToTrip = React.useCallback((item) => {
    navigate("/trips/" + item.trip_id);
  });

  const darkMode = useDarkMode();

  const [cursor, setCursor] = React.useState();

  const onMouseEnter = React.useCallback(() => {
    setCursor("pointer");
  }, []);

  const onMouseLeave = React.useCallback(() => {
    setCursor(null);
  }, []);

  const [clickedStop, setClickedStop] = React.useState(null);

  const handleMapClick = React.useCallback(
    (e) => {
      if (!e.originalEvent.defaultPrevented) {
        if (e.features.length) {
          for (const stop of e.features) {
            if (
              !stop.properties.url ||
              stop.properties.url !== clickedStop?.properties.url
            ) {
              setClickedStop(stop);
            }
          }
        } else {
          setClickedStop(null);
        }
        setClickedVehicleMarker(null);
      }
    },
    [clickedStop],
  );

  const [tripVehicle, setTripVehicle] = React.useState(null);
  const [vehicles, setVehicles] = React.useState(null);

  React.useEffect(() => {
    let timeout;
    let controller = new AbortController();

    const loadVehicles = (first) => {
      let url = `${apiRoot}vehicles.json`;
      if (window.VEHICLE_ID) {
        url = `${url}?id=${window.VEHICLE_ID}`;
      } else if (!window.SERVICE) {
        return;
      } else {
        url = `${url}?service=${window.SERVICE}&trip=${params.id}`;
      }
      fetch(url, {
        signal: controller.signal,
      }).then(
        (response) => {
          if (!response.ok) {
            return;
          }
          response.json().then((items) => {
            setVehicles(
              Object.assign(
                {},
                ...items.map((item) => {
                  if (
                    (params && item.trip_id == params.id) ||
                    (window.VEHICLE_ID && item.id === window.VEHICLE_ID)
                  ) {
                    if (first) {
                      setClickedVehicleMarker(item.id);
                    }
                    setTripVehicle(item);
                  }
                  return { [item.id]: item };
                }),
              ),
            );
          });
          clearTimeout(timeout);
          timeout = setTimeout(loadVehicles, 12000); // 12 seconds
        },
        (reason) => {
          // never mind
        },
      );
    };

    const loadTrip = () => {
      if (params) {
        if (trip && trip.id && params.id == trip.id.toString()) {
          return;
        }
        setTripVehicle(null);
        fetch(`${apiRoot}api/trips/${params.id}/`).then((response) => {
          if (response.ok) {
            response.json().then(setTrip);
          }
        });
      }
    };

    loadTrip();
    loadVehicles(true);

    const handleVisibilityChange = (event) => {
      if (event.target.hidden) {
        clearTimeout(timeout);
        controller.abort();
      } else {
        loadVehicles();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [params?.id]);

  const [clickedVehicleMarkerId, setClickedVehicleMarker] =
    React.useState(null);

  const handleVehicleMarkerClick = React.useCallback((event, id) => {
    event.originalEvent.preventDefault();
    setClickedStop(null);
    setClickedVehicleMarker(id);
  }, []);

  const handleMapLoad = React.useCallback((event) => {
    const map = event.target;
    map.keyboard.disableRotation();
    map.touchZoomRotate.disableRotation();

    map.loadImage("/static/route-stop-marker.png", (error, image) => {
      if (error) throw error;
      map.addImage("stop", image, {
        pixelRatio: 2,
        // width: 16,
        // height: 16
      });
    });
  }, []);

  const clickedVehicle =
    clickedVehicleMarkerId && vehicles[clickedVehicleMarkerId];

  const vehiclesList = vehicles ? Object.values(vehicles) : [];

  return (
    <React.Fragment>
      <div className="trip-map has-sidebar">
        <Map
          dragRotate={false}
          touchPitch={false}
          touchRotate={false}
          pitchWithRotate={false}
          maxZoom={16}
          bounds={bounds}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
          }}
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

          <Source
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: trip.times
                .filter((stop) => stop.track)
                .map((stop) => {
                  return {
                    type: "Feature",
                    geometry: {
                      type: "LineString",
                      coordinates: stop.track,
                    },
                  };
                }),
            }}
          >
            <Layer {...routeStyle} />
          </Source>

          <Source
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: trip.times
                .filter((stop) => stop.stop.location)
                .map((stop) => {
                  return {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: stop.stop.location,
                    },
                    properties: {
                      url: stop.stop.atco_code
                        ? `/stops/${stop.stop.atco_code}`
                        : null,
                      name: stop.stop.name,
                      bearing: stop.stop.bearing,
                    },
                  };
                }),
            }}
          >
            <Layer {...stopsStyle} />
          </Source>

          {vehiclesList.map((item) => {
            return (
              <VehicleMarker
                key={item.id || item.stop.atco_code}
                selected={item.id === clickedVehicleMarkerId}
                vehicle={item}
                onClick={handleVehicleMarkerClick}
              />
            );
          })}

          {clickedVehicle ? (
            <VehiclePopup
              item={clickedVehicle}
              activeLink={clickedVehicle?.trip_id == params?.id}
              onTripClick={navigateToTrip}
              onClose={() => {
                setClickedVehicleMarker(null);
              }}
            />
          ) : null}

          {clickedStop ? (
            <StopPopup
              item={clickedStop}
              onClose={() => setClickedStop(null)}
            />
          ) : null}
        </Map>
      </div>
      <TripTimetable
        trip={trip}
        vehicle={tripVehicle}
        // onMouseEnter={handleMouseEnter}
      />
    </React.Fragment>
  );
}