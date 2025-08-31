// RoutingControl.jsx
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { createControlComponent } from "@react-leaflet/core";

const createRoutineMachineLayer = ({ start, end }) => {
  const instance = L.Routing.control({
    waypoints: [L.latLng(...start), L.latLng(...end)],
    lineOptions: {
      styles: [{ color: "#0074D9", weight: 5 }],
    },
    showAlternatives: true,
    alternativeLineOptions: {
      styles: [{ color: "#00A2FF", weight: 3, opacity: 0.7, dashArray: "5,10" }],
    },
    addWaypoints: false,
    routeWhileDragging: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    show: false,
    router: L.Routing.openrouteservice("YOUR_OPENROUTESERVICE_API_KEY"), 
  });

  return instance;
};

const RoutingControl = createControlComponent(createRoutineMachineLayer);

export default RoutingControl;
