// Setting a list of places that I'm interested
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
];
// Knockout ViewModel
var ViewModel = function () {
    var self = this;

    // Markers variable

    self.markers           = ko.observableArray([]);

    // GOOGLE MAPS BELLOW

    self.init              = function () {

        // Bounds Variable for map fitting in screens

        var bounds = new google
            .maps
            .LatLngBounds();

        // Here I set the maps center option, this will be the initial place of the map.

        self.center = new google
            .maps
            .LatLng(37.805316, -122.445270);
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

        self.map = new google
            .maps
            .Map(document.getElementById('map'), mapOptions);

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
            bounds.extend(marker.position);

            // Variables that I use to create the infoWindow and it's content

            var wikiArticles  = [],
                thisPlaceDescription,
                thisPlaceName = data.name,
                infoWindowContent;

            // Wiki URL for the open search, here we find the info in json

            var wikiURL = 'http://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=' + thisPlaceName;

            // Getting the info from Wikipedia
            $.ajax({
                dataType: "jsonp",
                success : function (response) {
                    i = 0;
                    for (var article in response[1]) {
                        i++;

                        // Limiting Results to 5

                        if (i <= 5) {

                            // Here I push list items to the wikiArticles Array

                            wikiArticles.push("<li><a target='_blank' href='http://en.wikipedia.org/wiki/" + response[1][article] + "'>" + response[1][article] + "</a></li>");
                        }

                        // Here I get the description of the first result from Wikipedia

                        if (i === 1) {
                            thisPlaceDescription = response[2][article];
                        }
                    }

                },
                    url     : wikiURL
                })
                .done(function (data) {
                    // Update the infoWindow content

                    infoWindowContent = '<h5>' + thisPlaceName + '</h5> <h6>Wikipedia Description:</h6> <p>' + thisPlaceDescription + '</p> <p>Wikipedia Articles related to this location:</p><ul>' + wikiArticles.join('') + '</ul>';

                })
                .fail(function () {
                    // Just in case the info doesn't load from the Wikipedia API, we have already
                    // set a infoWindow content.
                    infoWindowContent = '<h5>' + thisPlaceName + '</h5> <p>Ops... Unable to reach Wikipedia info</p>';
                });
            $.ajax({});

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

                    // Makes the marker animate 2 times

                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        marker.setAnimation(null);
                    }, 1400);

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

        // Lets fit the map in screens

        self
            .map
            .fitBounds(bounds);
    };

    // Function for the Click Event

    self.setPlace          = function (marker) {
        google
            .maps
            .event
            .trigger(marker, 'click');
    };

    // Function for changing the map position

    self.centerMap         = function () {
        self
            .map
            .panTo(self.center);
    };

    self.searchQuery       = ko.observable('');
    self.searchQueryFilter = ko.computed(function () {

        return self
            .searchQuery()
            .toLowerCase();

    });

    // Search function that is run when user inserts a search query

    self.searchLoad        = ko.computed(function () {

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
    }, this);
    initMap                = function () {
        self.init();
    };
    mapsAPIError = function(){
        alert('Maps API failed to load!');
    }
};

$(ko.applyBindings(new ViewModel()));