let map;

function initMap() {
    console.log("callback")
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -37.8136, lng: 144.9631 },
        zoom: 12
        //mapTypeControl: false,
        //streetViewControl: false
    });
}