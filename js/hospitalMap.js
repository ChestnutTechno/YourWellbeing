let hospitalMap;
let userLocation;
let icon;

function initMap() {
    hospitalMap = new google.maps.Map(document.getElementById("hospital_map"), {
        center: {lat: -37.8136, lng: 144.9631},
        zoom: 10,
        mapId: "28c9117c2aa9ddc6",
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false
    });

    var inputContainer = document.createElement("div");
    addAddressInputControl(inputContainer);
    hospitalMap.controls[google.maps.ControlPosition.TOP_LEFT].push(inputContainer);

    icon = {
        url: "img/user_location_icon.png",
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(18, 18)
    };

    userLocation  = new google.maps.Marker();
    addHospitals("data/hospital.csv");

}

function addHospitals(file) {
    let icon = {
        url: "img/hospital_icon.png",
        scaledSize: new google.maps.Size(30, 30),
    };
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
                console.log(json);
                for (let i = 0; i < json.length; i++) {
                    const latLng = new google.maps.LatLng(json[i]["lat"], json[i]["lon"]);

                    let contentString =
                        '<div>' +
                        '<span style="color: #0f0c1c;font-weight: bold">State: </span> <span style="color: #0f0c1c">' + json[i]['State'] + '</span><br><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Hospital name: </span> <span style="color: #0f0c1c">' + json[i]['Hospital.name'] + '</span>' +
                        '</div>'

                    let hospitalInfowindow = new google.maps.InfoWindow({
                        content: contentString,
                    });

                    let marker = new google.maps.Marker({
                        position: latLng,
                        map: hospitalMap,
                        icon: icon
                    });

                    marker.addListener("mouseover", () => {
                        hospitalInfowindow.open({
                            anchor: marker,
                            hospitalMap,
                            shouldFocus: false,
                        });
                    });

                    marker.addListener("mouseout", () => {
                        hospitalInfowindow.close();
                    });
                }
            }
        }
    }
    rawFile.send(null);
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

function getRealtimeLocation(){
    navigator.geolocation.getCurrentPosition(function (position){
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        hospitalMap.panTo(new google.maps.LatLng(lat,lon));
        userLocation.setPosition(new google.maps.LatLng(lat,lon));
        userLocation.setIcon(icon);
        userLocation.setMap(hospitalMap);
        hospitalMap.setZoom(14);
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

            hospitalMap.panTo(new google.maps.LatLng(lat, lon));
            userLocation.setPosition(new google.maps.LatLng(lat, lon));
            userLocation.setIcon(icon);
            userLocation.setMap(hospitalMap);
            hospitalMap.setZoom(14);
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

function addAddressInputControl(container) {
    var addressUI = document.createElement("div");
    addressUI.setAttribute("id", "add_input_form");
    addressUI.style.width = "900px";
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
    inputBox.setAttribute("placeholder", "Address");
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
    button.style.marginLeft = "10px";
    button.style.fontSize = "16px";
    container.appendChild(button);

    locationIcon.addEventListener("mouseover", function() {
        locationIcon.style.color = "#0f0c1c";
    })

    locationIcon.addEventListener("mouseout", function() {
        locationIcon.style.color = "";
    })



}