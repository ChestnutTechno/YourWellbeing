let map;
let markers = [];
let tracksLayer;
let sitesLayer;
let destination;
let userLocation;
let directionsService;
let directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -37.9099, lng: 145.1324 },
        zoom: 15,
        mapTypeControl: false,
        mapId: "28c9117c2aa9ddc6"
    });

    getRealtimeLocation();

    icon = {
        url: "img/user_location_icon.png",
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(18, 18)
    };
    var dst_icon = {
        url: "img/map_pin_icon.png",
        scaledSize: new google.maps.Size(40, 40)
    }

    userLocation  = new google.maps.Marker();
    destination = new google.maps.Marker();
    destination.setIcon(dst_icon);

    // add control divs
    const markersControlDiv = document.createElement("div");
    const tracksControlDiv = document.createElement("div");
    const sitesControlDiv = document.createElement("div");
    const addressInputDiv = document.createElement("div");
    addAddressInputControl(addressInputDiv);
    markersControl(markersControlDiv);
    tracksControl(tracksControlDiv);
    sitesControl(sitesControlDiv);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(addressInputDiv);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(markersControlDiv);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(tracksControlDiv);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(sitesControlDiv);

    // add legend
    let legend = document.getElementById('legend');
    let facilityLgd = document.createElement("div");
    let siteLgd = document.createElement("div");
    let trackLgd = document.createElement("div");
    facilityLgd.innerHTML = '<img src="img/map_pin_icon.png" style="width: 30px;height: 30px;"><span>Sport Facility</span>';
    siteLgd.innerHTML = '<img src="img/mountain_icon.png" style="width: 30px;height: 30px;"><span>Recreation site</span>';
    trackLgd.innerHTML = '<svg height="30px" width="30px"><line x1="5" y1="25" x2="25" y2="25" style="stroke:#e08600;stroke-width:10;stroke-linecap: round"/></svg><span>Cycling/Walking track</span>'

    legend.appendChild(facilityLgd);
    legend.appendChild(siteLgd);
    legend.appendChild(trackLgd);
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    addFacilities("data/fac.csv");
    addTracks("data/recweb_track.json");
    addSites("data/recweb_site.json");

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        panel: document.getElementById("panel"),
    });


}

function csvToJSON(string, headers, quoteChar = '"', delimiter = ','){
    const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, 'gs');
    const match = string => [...string.matchAll(regex)].map(match => match[2])
        .filter((_, i, a) => i < a.length - 1); // cut off blank match at end

    const lines = string.split('\n');
    const heads = headers || match(lines.splice(0, 1)[0]);

    return lines.map(line => match(line).reduce((acc, cur, i) => ({
        ...acc,
        [heads[i] || `extra_${i}`]: (cur.length > 0) ? (Number(cur) || cur) : null
    }), {}));
}

/*
This function will add markers and tooltips on the google map that represent recreation facilities.

@param: a csv file that stores the geolocation data of recreation facilities
 */
function addFacilities(file) {
    let icon = {
        url: "img/map_pin_icon.png",
        scaledSize: new google.maps.Size(30, 30),
    }
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                var json = csvToJSON(allText);
                for (let i = 0; i < json.length; i++) {
                    const latLng = new google.maps.LatLng(json[i].Latitude, json[i].Longitude);

                    let contentString =
                        '<div>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Name: </span> <span style="color: #0f0c1c">' + json[i]['Facility Name'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Sports: </span> <span style="color: #0f0c1c">' + json[i]['Sports Played'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Field/Surface type: </span> <span style="color: #0f0c1c">' + json[i]['Field/Surface Type'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Address: </span> <span style="color: #0f0c1c">' + json[i]['FullAddress'] + '</span><br><hr style="border: 1px dashed #0f0c1c">' +
                        '<span style="color: #0f0c1c;font-weight: bold">Choose your prefered way to get here: </span><br><br>' +
                        '<span class="nav_icon" id="walk" style="margin: 0 10px 0 10px"><i class="fas fa-walking fa-2x"></i></span>' +
                        '<span class="nav_icon" id="transit" style="margin: 0 10px 0 10px"><i class="fas fa-bus fa-2x"></i></span>' +
                        '<span class="nav_icon" id="drive" style="margin: 0 10px 0 10px"><i class="fas fa-car fa-2x"></i></span><br>' +
                        '</div>'

                    let infowindow = new google.maps.InfoWindow({
                        content: contentString,
                    });

                    let marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        icon: icon
                    });

                    markers.push(marker);

                    marker.addListener("click", () => {
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        });
                    })

                    infowindow.addListener('domready', function() {
                        $("#walk").on("click", function() {
                            infowindow.close();
                            hideMarkers();
                            destination.setPosition(latLng);
                            destination.setMap(map);
                            calculateAndDisplayRoute(directionsService, directionsRenderer, userLocation.getPosition(), latLng, google.maps.TravelMode.WALKING);
                        })
                        $("#transit").on("click", function(){
                            infowindow.close();
                            hideMarkers();
                            destination.setPosition(latLng);
                            destination.setMap(map);
                            calculateAndDisplayRoute(directionsService, directionsRenderer, userLocation.getPosition(), latLng, google.maps.TravelMode.TRANSIT);
                        });
                        $("#drive").on("click", function(){
                            infowindow.close();
                            hideMarkers();
                            destination.setPosition(latLng);
                            destination.setMap(map);
                            calculateAndDisplayRoute(directionsService, directionsRenderer, userLocation.getPosition(), latLng, google.maps.TravelMode.DRIVING);
                        });
                    })

                    map.addListener("click", () => {
                        infowindow.close();
                        directionsRenderer.set('directions', null);
                        marker.setMap(map);
                        destination.setMap(null);
                    })


                }
            }
        }
    }
    rawFile.send(null);
}

function addTracks(file) {
    tracksLayer = new google.maps.Data();
    tracksLayer.loadGeoJson(file);
    tracksLayer.setStyle({
        strokeWeight: 4,
        strokeColor: "#e08600",

    });

    let tracksInfoWindow = new google.maps.InfoWindow();

    tracksLayer.addListener("mouseover", function(event) {
        tracksLayer.setStyle({strokeWeight: 8, strokeColor: "#e08600"});
        let contentString = '<span style="color: #0f0c1c">' + event.feature.getProperty("NAME") + '</span>';
        tracksInfoWindow.setContent(contentString);
        tracksInfoWindow.setPosition(event.latLng);
        tracksInfoWindow.setOptions({pixelOffset: new google.maps.Size(0,-10)});
        tracksInfoWindow.open(map);
    });

    tracksLayer.addListener("mousemove", function(event) {
        tracksInfoWindow.setPosition(event.latLng);
        tracksInfoWindow.setOptions({pixelOffset: new google.maps.Size(0,-10)});
    })

    tracksLayer.addListener("mouseout", function() {
        tracksLayer.setStyle({strokeWeight: 5, strokeColor: "#e08600"});
        tracksInfoWindow.close();
    })


    tracksLayer.setMap(map);

}

function addSites(file) {
    let icon = {
        url: "img/mountain_icon.png",
        scaledSize: new google.maps.Size(30, 30),
    }
    sitesLayer = new google.maps.Data();
    sitesLayer.loadGeoJson(file);
    sitesLayer.setStyle({
        icon: icon
    });

    let sitesInfoWindow = new google.maps.InfoWindow();

    sitesLayer.addListener("mouseover", function(event) {
        let contentString = '<span style="font-weight:bold;color: #0f0c1c">Name: </span><span style="color: #0f0c1c">' + event.feature.getProperty("NAME") + '</span><br><br>' +
        '<span style="font-weight:bold;color: #0f0c1c">Access Instruction: </span><p style="color: #0f0c1c;text-align: justify;">' + event.feature.getProperty("ACCESS_DSC") + '</p>';
        sitesInfoWindow.setContent(contentString);
        sitesInfoWindow.setPosition(event.latLng);
        sitesInfoWindow.setOptions({
            pixelOffset: new google.maps.Size(0,-30),
            maxWidth: 300
        });
        sitesInfoWindow.open(map);
    });
    sitesLayer.addListener("mouseout", function(event) {
        sitesInfoWindow.close();
    });
    sitesLayer.setMap(map);
}

function creatControlUI(controlDiv, innerText){
    // Set CSS for the control border.
    let controlUI = document.createElement("div");

    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginBottom = "8px";
    controlUI.style.marginRight = "10px";
    controlUI.style.textAlign = "center";
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let controlText = document.createElement("div");

    controlText.style.color = "rgb(86,86,86)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "18px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = innerText;
    controlUI.appendChild(controlText);

    controlUI.addEventListener("mouseover", function() {
        controlUI.style.backgroundColor = "#e5e5e5";
        controlUI.style.border = "2px solid #e5e5e5";
        controlText.style.color = "rgb(25,25,25)";

    });
    controlUI.addEventListener("mouseout", function() {
        controlUI.style.backgroundColor = "#fff";
        controlUI.style.border = "2px solid #fff";
        controlText.style.color = "rgb(86,86,86)";
    })
    return(controlUI);
}


function markersControl(controlDiv) {
    const markerControlUI = creatControlUI(controlDiv, "Hide Facilities");

    let show = true;
    // Setup the click event listeners: simply set the map to Chicago.
    markerControlUI.addEventListener("click", () => {
        let nodes = markerControlUI.childNodes;
        if(show){
            nodes.item(0).innerHTML =  "Show Facilities";
            hideMarkers();
            show = false;
        }else {
            nodes.item(0).innerHTML =  "Hide Facilities";
            showMarkers();
            show = true;
        }
    });
}

function tracksControl(controlDiv){
    const trackControlUI = creatControlUI(controlDiv, "Hide Tracks");

    let show = true;
    // Setup the click event listeners: simply set the map to Chicago.
    trackControlUI.addEventListener("click", () => {
        let nodes = trackControlUI.childNodes;
        if(show){
            nodes.item(0).innerHTML =  "Show Tracks";
            hideTracks();
            show = false;
        }else {
            nodes.item(0).innerHTML =  "Hide Tracks";
            showTracks();
            show = true;
        }
    });
}

function sitesControl(controlDiv) {
    const sitesControlUI = creatControlUI(controlDiv, "Hide Sites");

    let show = true;
    // Setup the click event listeners: simply set the map to Chicago.
    sitesControlUI.addEventListener("click", () => {
        let nodes = sitesControlUI.childNodes;
        if(show){
            nodes.item(0).innerHTML =  "Show Sites";
            hideSites();
            show = false;
        }else {
            nodes.item(0).innerHTML =  "Hide Sites";
            showSites();
            show = true;
        }
    });
}

function getAddress() {
    let addressBox = $("#address").val();
    if(addressBox == ""){
        alert("address cannot be empty");
        return;
    }

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': addressBox}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var lat = results[0].geometry.location.lat();
            var lon = results[0].geometry.location.lng();

            map.panTo(new google.maps.LatLng(lat, lon));
            userLocation.setPosition(new google.maps.LatLng(lat, lon));
            userLocation.setIcon(icon);
            userLocation.setMap(map);
        } else {
            if(status == google.maps.GeocoderStatus.ZERO_RESULTS){
                alert("Could find your address, please try to enter full address e.g. 123 Fake Ave. FakeTown Fake postcode");
            }
            if(status == google.maps.GeocoderStatus.ERROR ||
                status == google.maps.GeocoderStatus.UNKNOWN_ERROR ||
                status == google.maps.GeocoderStatus.INVALID_REQUEST ||
                status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
                alert("Oops, some error occurs. Please try again later");
            }
            if(status == google.maps.GeocoderStatus.REQUEST_DENIED){
                alert("Request denied");
            }
        }
    });
}

function addNavPanel(container){
    var panel = document.createElement("div");
    panel.setAttribute("id","panel");
    container.appendChild(panel);
}

function addAddressInputControl(container) {
    var addressUI = document.createElement("div");
    addressUI.setAttribute("id", "add_input_form");
    addressUI.style.width = "400px";
    addressUI.style.height = "40px";
    addressUI.style.marginTop = "-40px";
    addressUI.style.marginLeft = "10px";
    container.appendChild(addressUI);

    var inputBox = document.createElement("input");
    inputBox.setAttribute("class", "card");
    inputBox.setAttribute("id", "address");
    inputBox.style.padding = "0 0 0 10px";
    inputBox.style.marginLeft = "10px";
    inputBox.style.height = "40px";
    inputBox.style.width = "80%";
    inputBox.style.fontSize = "16px";
    inputBox.style.color = "#0f0c1c";
    inputBox.style.borderTopRightRadius = "0";
    inputBox.style.borderBottomRightRadius = "0";
    inputBox.style.borderColor = "#0f0c1c";
    inputBox.setAttribute("type", "text");
    inputBox.setAttribute("placeholder", "Your departure address here");
    container.appendChild(inputBox);

    var center = {lat: -37.8136, lng: 144.9631};
    const defaultBounds = {
        north: center.lat + 1,
        south: center.lat - 1,
        east: center.lng + 1,
        west: center.lng - 1,
    };
    const options = {
        bounds: defaultBounds,
        componentRestrictions: { country: "au" },
        fields: ["address_components"],
        strictBounds: false,
        types: ["address"],
    };
    let autoComplete = new google.maps.places.Autocomplete(inputBox, options);

    var iconContainer = document.createElement("span");
    iconContainer.setAttribute("onclick", "getRealtimeLocation()");
    iconContainer.style.marginLeft = "-40px";
    container.appendChild(iconContainer);

    var locationIcon = document.createElement("i");
    locationIcon.setAttribute("class", "fa fa-location-arrow fa-2x");
    locationIcon.setAttribute("aria-hidden", "true");
    iconContainer.appendChild(locationIcon);

    var button = document.createElement("button");
    button.setAttribute("id", "sub_add");
    button.setAttribute("class", "nm_btn");
    button.setAttribute("onclick", "getAddress()");
    button.textContent = "Search";
    button.style.borderTopLeftRadius = "0";
    button.style.borderBottomLeftRadius = "0";
    button.style.borderTopRightRadius = "10px";
    button.style.borderBottomRightRadius = "10px";
    button.style.borderBottomLeftRadius = "0";
    button.style.width = "15%";
    button.style.marginLeft = "8px";
    button.style.fontSize = "16px";
    container.appendChild(button);

    locationIcon.addEventListener("mouseover", function() {
        locationIcon.style.color = "#0f0c1c";
    })

    locationIcon.addEventListener("mouseout", function() {
        locationIcon.style.color = "";
    })

}

function getRealtimeLocation(){
    navigator.geolocation.getCurrentPosition(function (position){
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        map.panTo(new google.maps.LatLng(lat,lon));
        userLocation.setPosition(new google.maps.LatLng(lat,lon));
        userLocation.setIcon(icon);
        userLocation.setMap(map);
    });
}

function calculateAndDisplayRoute(service, renderer, origin, destination, travelMode) {
    service
        .route({
            origin: origin,
            destination: destination,
            optimizeWaypoints: true,
            travelMode: travelMode,
        })
        .then((response) => {
            renderer.setDirections(response);

            const route = response.routes[0];
            const summaryPanel = document.getElementById("directions-panel");

        })
        .catch((e) => window.alert("Directions request failed due to " + e));
}

function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function hideMarkers() {
    setMapOnAll(null);
}

function showMarkers() {
    setMapOnAll(map);
}

function hideTracks() {
    tracksLayer.setMap(null);
}

function showTracks() {
    tracksLayer.setMap(map);
}

function hideSites() {
    sitesLayer.setMap(null);
}

function showSites() {
    sitesLayer.setMap(map);
}



