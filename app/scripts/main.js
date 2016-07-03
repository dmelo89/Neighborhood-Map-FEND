var myPlaces = [
    {
        coords: {
            lat: 37.781362,
            lng: -122.416980
        },
        name  : 'Philz Coffee'
    }, {
        coords: {
            lat: 37.827603,
            lng: -122.422895
        },
        name  : 'Alcatraz Island'
    }, {
        coords: {
            lat: 37.808817,
            lng: -122.409800
        },
        name  : 'PIER 39'
    }, {
        coords: {
            lat: 37.820081,
            lng: -122.478255
        },
        name  : 'Golden Gate Bridge'
    }, {
        coords: {
            lat: 37.769268,
            lng: -122.486278
        },
        name  : 'Golden Gate Park'
    }
]
var ViewModel = function () {
    var self = this;

    // GOOGLE MAPS BELLOW Here I set the maps center opition, this will be the
    // initial place of the map.

    self.center            = new google
        .maps
        .LatLng(37.805316, -122.445270);

    self.init              = function () {

        // In the mapOptions var I set the custom options for the Google Maps Object
        var mapOptions = {
            center                  : self.center,
            mapTypeControl          : true,
            mapTypeControlOptions   : {
                position: google.maps.ControlPosition.BOTTOM_CENTER,
                style   : google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            scaleControl            : true,
            streetViewControl       : true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            zoom                    : 13,
            zoomControl             : true,
            zoomControlOptions      : {
                position: google.maps.ControlPosition.RIGHT_CENTER
            }
        };

        // Here I create a Google Maps Object with the mapOptions

        self.map     = new google
            .maps
            .Map(document.getElementById('map'), mapOptions);

        self.markers = ko.observableArray([]);


        // Create the markers and push it into self.markers array

        $.each(myPlaces, function (key, data) {
            var marker = new google
                .maps
                .Marker({
                    animation  : google.maps.Animation.DROP,
                    listVisible: ko.observable(true),
                    map        : self.map,
                    name       : data.name,
                    position   : new google
                        .maps
                        .LatLng(data.coords.lat, data.coords.lng)
                });
            // Bind a infowindow object and animation for marker
            var wikiArticles = [];
            var thisPlaceDescription;
            var thisPlaceName = data.name;

            // Just in case the info doesn't load from the Wikipedia API, we have already set a infoWindow content.

            var infoWindowContent = '<h5>' + thisPlaceName + '</h5> <p>Ops... Unable to reach Wikipedia info</p>';
            
            // Wiki URL for the open search, here we find the info in json

            var wikiURL = 'http://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=' + thisPlaceName;

            // Getting the info from Wikipedia

            $.ajax({
                dataType: "jsonp",
                success : function (response) {
                    i = 0;
                    for (article in response[1]) {
                        i++
                        // Limiting Results to 5
                        if (i <= 5) {
                        // Here I push list items to the wikiArticles Array
                        wikiArticles.push("<li><a target='_blank' href='http://en.wikipedia.org/wiki/" + response[1][article] + "'>" + response[1][article] + "</a></li>");
                        }
                        // Here I get the description of the First result from Wikipedia
                        if (i === 1) {
                            thisPlaceDescription = response[2][article];
                        }
                    }
                    infoWindowContent = '<h5>' + thisPlaceName + '</h5> <h6>Wikipedia Description:</h6> <p>' + thisPlaceDescription +'</p> <p>Wikipedia Articles related to this location:</p><ul>'+ wikiArticles.join('') +'</ul>';
                },
                url     : wikiURL
            });

            self.infowindow = new google
                .maps
                .InfoWindow();
            google
                .maps
                .event
                .addListener(marker, 'click', function () {
                    self
                        .map
                        .panTo(marker.getPosition());

                    // Makes the marker animate for 3 seconds

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 3000);

                    // Set the InfoWindow Content

                    self
                        .infowindow
                        .setContent(infoWindowContent);

                    self
                        .infowindow
                        .open(self.map, this);
                });
            // Pushes markers to array
            self
                .markers
                .push(marker);
        });
        // Event that makes the map center load the original value when closing a
        // infowindow
        google
            .maps
            .event
            .addListener(self.infowindow, 'closeclick', function () {
                self.centerMap();
            });
    };

    self.setPlace          = function (marker) {
        google
            .maps
            .event
            .trigger(marker, 'click');
    };

    self.centerMap         = function () {
        self
            .map
            .panTo(self.center);
    };

    self.searchQuery = ko.observable("");
    self.searchQueryFilter = ko.computed(function () {

        return self
            .searchQuery()
            .toLowerCase();

    });

    self.searchLoad        = function () {

        var userInput = self.searchQueryFilter();

        self
            .markers()
            .forEach(function (marker) {
                var eachMarker = marker
                    .name
                    .toLowerCase();

                (eachMarker.indexOf(userInput) === -1)
                    ? marker.setMap(null)
                    : marker.setMap(self.map);
                (eachMarker.indexOf(userInput) === -1)
                    ? marker.listVisible(false)
                    : marker.listVisible(true);

            });
    };
    self.init();
};

$(ko.applyBindings(new ViewModel()));
// function initMap() {     var mapDiv = document.getElementById('map');     var
// map = new google         .maps         .Map(mapDiv, {             center: {
// lat: 37.776960,                 lng: -122.419588             }, zoom  : 13
// }); }