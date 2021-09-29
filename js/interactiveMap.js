let map;
let markers = [];
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -37.9099, lng: 145.1324 },
        zoom: 15,
        mapId: "28c9117c2aa9ddc6",
        //mapTypeControl: false,
        //streetViewControl: false
    });
    const centerControlDiv = document.createElement("div");
    markersControl(centerControlDiv);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);
    addFacilities("data/fac.csv");
    addTracks("data/recweb_track.json");
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
    var icon = {
        url: "img/map_pin_icon.png",
        scaledSize: new google.maps.Size(30, 30),
    }
    var rawFile = new XMLHttpRequest();
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

                    const contentString =
                        '<div>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Name: </span> <span style="color: #0f0c1c">' + json[i]['Facility Name'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Sports: </span> <span style="color: #0f0c1c">' + json[i]['Sports Played'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Field/Surface type: </span> <span style="color: #0f0c1c">' + json[i]['Field/Surface Type'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Address: </span> <span style="color: #0f0c1c">' + json[i]['FullAddress'] + '</span><br>' +
                        '</div>'

                    const infowindow = new google.maps.InfoWindow({
                        content: contentString,
                    });

                    const marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        icon: icon
                    });

                    markers.push(marker);

                    marker.addListener("mouseover", () => {
                        infowindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        });
                    });

                    marker.addListener("mouseout", () => {
                        infowindow.close();
                    });
                }
            }
        }
    }
    rawFile.send(null);
}

function addTracks(file) {
    const tracksLayer = new google.maps.Data();
    tracksLayer.loadGeoJson(file);
    tracksLayer.setStyle({
       strokeWeight: 5,
       strokeColor: 'red'
    });
    tracksLayer.setMap(map);
}


function markersControl(controlDiv) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");

    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginBottom = "22px";
    controlUI.style.marginRight = "10px";
    controlUI.style.textAlign = "center";
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    const controlText = document.createElement("div");

    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Hide Facilities";
    controlUI.appendChild(controlText);

    var show = true;
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", () => {
        if(show){
            controlText.innerHTML = "Show Facilities";
            hideMarkers();
            show = false;
        }else {
            controlText.innerHTML = "Hide Facilities";
            showMarkers();
            show = true;
        }
    });
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



