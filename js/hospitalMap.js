let hospitalMap;

function initMap() {
    hospitalMap = new google.maps.Map(document.getElementById("hospital_map"), {
        center: {lat: -37.8136, lng: 144.9631},
        zoom: 10,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false
    });
    addHospitals("data/hospital.csv");

}

function addHospitals(file) {
    let icon = {
        url: "img/map_pin_icon.png",
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
    })
}