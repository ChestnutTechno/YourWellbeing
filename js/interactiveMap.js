let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -37.9099, lng: 145.1324 },
        zoom: 15
        //mapTypeControl: false,
        //streetViewControl: false
    });
    addFacilities("data/fac.csv")
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
function addFacilities(file)
{
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
                        '<span style="color: #0f0c1c;font-weight: bold">Name: </span> <span style="color: #0f0c1c">' + json[i]['Facility Name'] + '</span><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Sports: </span> <span style="color: #0f0c1c">' + json[i]['Sports Played'] + '</span><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Field/Surface type: </span> <span style="color: #0f0c1c">' + json[i]['Field/Surface Type'] + '</span><br>' +
                        '<span style="color: #0f0c1c;font-weight: bold">Address: </span> <span style="color: #0f0c1c">' + json[i]['FullAddress'] + '</span><br>' +
                        '</div>'

                    const infowindow = new google.maps.InfoWindow({
                        content: contentString,
                    });

                    const marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                    });


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


