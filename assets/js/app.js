var log = {
    ptrLoginName: document.getElementById("boozer-name"),
    ptrLogSubmit: document.getElementById("login-submit"),
    userName: "",
    db: "",
    savedSearches: [],

    firebaseInit: function() {
    var config = {
        apiKey: "AIzaSyA6E_I1QkMziPrgOY8HGH3my5LnTPzLKNE",
        authDomain: "brewnearyou-4ba3e.firebaseapp.com",
        databaseURL: "https://brewnearyou-4ba3e.firebaseio.com",
        storageBucket: "brewnearyou-4ba3e.appspot.com",
        messagingSenderId: "671751532718"
    };
    firebase.initializeApp(config);
    log.db = firebase.database();
    },    

    init: function() {
      console.log( "Startup log" );
        log.ptrLoginName = document.getElementById("boozer-name");
        log.ptrLogSubmit = document.getElementById("login-submit"); 

        log.ptrLogSubmit.addEventListener("click", log.signIn);
        log.ptrLoginName.addEventListener("keypress", log.signIn);

        log.firebaseInit();
        $(".modal").modal();
    },

    signIn: function(e) {
        if (e.type === "keypress") {
          var key = e.keypress || e.which;
          if ( key !== 13 ) return;
          e.preventDefault();
        }
        log.userName = log.ptrLoginName.value;
        log.ptrLoginName.value = "";

        log.savedSearches = [];   // Clear any previously saved searches
        log.db.ref("/users/" + log.userName ).on( "child_added", log.loadSavedSearches );
        log.dump();
        $(".modal").modal("hide");
    },

    loadSavedSearches: function( snap ) {
      var search = snap.val();
      log.savedSearches.push( search );
      log.savedSearches.sort( function( a, b ) { return b.timeStamp - a.timeStamp });
    },

    addSearch: function( searchValue ) {
      log.db.ref("/users/" + log.userName ).push( { name: log.userName, search: searchValue, timeStamp: moment().format('X')});
    },

    dump: function() {
      console.log( log );
    }

}

var desc = {

    trim: function( description, maxLen, website ) {
        var desc = description;
        // console.log( "Input: " + description );
        // console.log( "Length:" + description.length );
        // console.log( "MaxLen:" + maxLen );

        if ( description.length > maxLen ) {
            desc = description.substring( 0, maxLen ) + "<a src='" + website + "'>...</a>";
        }

        return desc;
    },

}

var searchChoice = {
    apiCall: function(text, selection){
            var apiKey = "1cbc423bb1707d8a61ba789f16567265";        
            var bdbURL = "https://api.brewerydb.com/v2/search?q="
                         + text + "&type=" + selection + "&withLocations=Y"
                         + "&key=" + apiKey;

            $.ajax({
                url: bdbURL,
                method: "GET"
            }).done(function(response) {
                var results = response;
                //Do stuff with results here.
                // console.log(results);
                //addContent.addDiv( results );
            });
    },

    submitListener: function() {
        $("#submitSearch").on("click", searchChoice.selection);
        $("#searchForm").on("keypress", searchChoice.selection);
    },

    selection: function(event){
        if (event.type === "keypress") {
            var key = event.keypress || event.which;
            if ( key !== 13 ) return;
        }
            event.preventDefault();

            $("#search-results").empty();

            //Assign dropdown value and user input to variables

            var userInput = $("#location-entry").val().trim();
            var userSelection =$ ('.selectpicker').selectpicker('val');

            // Check if search box is empty; if so, do nothing

            if (!userInput){
                //Don't do the API call if nothing in input.
                alert("Please enter stuffs.");
                return;

            } else if (userSelection === "zipcode"){

                if ((userInput.length != 5) || (!userInput.match(/^[0-9]+$/))){
                    alert("Please enter a 5-digit zip code.")
                } else {
                    scr.getPostalCodes(userInput);
                    log.addSearch(userInput);
                    longlat.locationByZip(userInput);
                }     

            } else if ((userSelection === "brewery") || (userSelection === "beer")){
                //Make the API call passing userInput and userSelection 
                searchChoice.apiCall(userInput, userSelection);
                log.addSearch(userInput, userSelection);
            } else {
                //Error handling? Perhaps a humorous error/unknown message
                // console.log("WAT.");
            }
        }
    }

var scr = {
    postalCodeURLTemplate: "https://www.zipcodeapi.com/rest/bAef3NKEmCDbPs6umD45DED6FkV5QoF1YUg2H1H3DketNkX9X1fBGTIldDq42561/radius.json/ZIP-CODE/10/mile",
    postalCodeURL: "",
    ptrSearchFrame: "",
    dump: "",

    getPostalCodes: function( zipCode ) {
        // console.log( "Making the AJAX call." );

        scr.postalCodeURL = scr.postalCodeURLTemplate.replace( /ZIP-CODE/, zipCode );
        // console.log( scr.postalCodeURL );

        $.ajax( scr.postalCodeURL )
        .done( function( data ) {
            var zips = data.zip_codes;
            scr.stepThroughZips( zips );
        });
    },

    stepThroughZips: function( zip_list ) {
        var i = setInterval( function() {
            if ( zip_list.length > 0 ) {
                scr.getByZip( zip_list.pop() );
            } else {
                clearInterval(i);
            }
        }, 90 );
    },

    getByZip: function( pzip ) {
        var zip = pzip.zip_code;
        var brewURL = "https://api.brewerydb.com/v2/locations?key=1cbc423bb1707d8a61ba789f16567265&format=json&postalCode=";
        // console.log( "getByZip: " + zip );
        $.ajax ( brewURL + zip )
        .done( function( data ) {
            if ( data.data ) addContent.addDiv( data, pzip.distance );
            console.log( data );
        });
        // console.log( JSON.stringify( scr.dump ))
    }
}

// // Adding longitude and latitude coordinates to Google map based on user input (zipcode).
var longlat = {
    postalCodeURL: 'https://www.zipcodeapi.com/rest/RZN3ICae8ONRQlyjw6beWMgFuIRqwMxnMkrvXBJ5qwXgSvAoCLDyyTd3C5t8S1vE/info.json/ZIP-CODE/degrees',
    postalCodeURL: "",
    locationByZip: function(geoZip) {
        longlat.postalCodeURL = longlat.postalCodeURL.replace( /ZIP-CODE/, geoZip );
        console.log("Running!!!!!!!!!!!!!!!!!!!!!!!!");
        $.ajax(longlat.postalCodeURL)
        .done(function(data) {
            var lng = data.lng;
            var lat = data.lat;
            console.log(data.lng + "LOOOOOOOOOOOOOOOOOOOOONG!");
            console.log(data.lat + "LAAAAAAAAAAAAAAAAAAAAAAT!");
        });
    }
}

var addContent = {

    addDiv: function( breweries, distance ) {
        // console.log( "Breweries.data ::", JSON.stringify( breweries ) );
        var brew;

        for ( var i = 0; i<breweries.data.length; i++ ) {
            let d = breweries.data[i];
            if ( d.brewery ) {
                brew = {
                    breweryId: d.breweryId,
                    name: d.brewery.name,
                    nameShortDisplay: d.nameShortDisplay,
                    description: d.brewery.description,
                    breweryName: d.brewery.name,
                    hoursOfOperation: d.hoursOfOperation,
                    latitude: d.latitude,
                    longitude: d.longitude,
                    phone: d.phone,
                    extendedAddress: d.extendedAddress,
                    streetAddress: d.streetAddress,
                    city: d.locality,
                    state: d.region,
                    zip: d.postalCode,
                    country: d.country.isoThree,
                    website: d.website,
                    locationType: d.locationTypeDisplay,
                    distance: distance,
                    icon: icon,
                    latlon: d.latitude.trim + "," + d.longitude.trim,
                    icon: d.brewery.images === undefined  ? "" : d.brewery.images.icon
                };
            } else {
                brew = {
                    breweryId: d.id,
                    name: d.name,
                    nameShortDisplay: d.nameShortDisplay,
                    description: d.description,
                    breweryName: d.name,
                    hoursOfOperation: d.hoursOfOperation,
                    latitude:         d.locations ? d.locations[0].latitude : "",
                    longitude:        d.locations ? d.locations[0].longitude : "",
                    phone:            d.locations ? d.locations[0].phone : "",
                    extendedAddress:  d.locations ? d.locations[0].extendedAddress : "",
                    streetAddress:    d.locations ? d.locations[0].streetAddress : "",
                    city:             d.locations ? d.locations[0].locality : "",
                    state:            d.locations ? d.locations[0].region : "",
                    zip:              d.locations ? d.locations[0].postalCode : "",
                    country:          d.locations ? d.locations[0].country.isoThree : "",
                    website:          d.locations ? d.locations[0].website : "",
                    locationType:     d.locations ? d.locations[0].locationTypeDisplay : "",
                    distance: distance,
                    icon: d.images === undefined ? "" : d.images.icon,
                    type: d.type,
                    latlon: d.locations[0].latitude.trim + "," + d.locations[0].longitude.trim
                };      
            }

            if ( brew.website === undefined ) brew.website = "";    

            addContent.dump( brew );

            var icon = d.icon;

            var icon = d.brewery.images === undefined  ? "" : d.brewery.images.icon;
            var $div = $("<li class='list-group-item row'>");
            var div2 = $("<div class='row'>");
            var div3 = $("<div class='col-xs-2'>");
            var pic = $("<img class='breweryPic'>");
            pic.attr("src", icon);
            div3.append(pic);
            div2.append(div3);
            var div4 = $("<div class='col-xs-8'>")
            div4.append($("<br><h3><b>Name: </b></h3><h3 class='bname'>" + brew.name + "</h3><br>"));
            div4.append( $("<h3><b>Hours: </b></h3><h3 class='hours'>" + brew.hoursOfOperation + "</h3><br>"));
            div4.append( $("<h3><b>Street: </b></h3><h3 class='street-address'>" + brew.streetAddress +"</h3><br>"));
            div4.append( $("<h3><b>Phone: </b></h3><h3 class='phone'>" + brew.phone + "</h3><br>"));
            div4.append( $("<h3><b>Website: </b></h3><h3 class='website'>" + "<a href='" + brew.website + "'>" + brew.website + "</a></h3><br>"));
            div2.append(div4);
            var div5 = $("<div class='row'>")
            div5.append( $("<h3><b>Description: </b></h3><p class='description'>" + brew.description + "</p><br>"));

            addContent.addMarker( brew );

            // console.log( brew );
            $div.append(div2);
            $div.append(div5);

            $("#search-results").prepend($div);
            // console.log( d.latitude + "," + d.longitude );
        }
    },

    dump: function( brew ) {
                    // console.log( 'breweryId :', brew.breweryId );
                    // console.log( 'name :', brew.name );
                    // console.log( 'nameShortDisplay :', brew.nameShortDisplay );
                    // console.log( 'description :', brew.description );
                    // console.log( 'breweryName :', brew.breweryName );
                    // console.log( 'hoursOfOperation :', brew.hoursOfOperation );
                    // console.log( 'latitude :', brew.latitude );
                    // console.log( 'longitude :', brew.longitude );
                    // console.log( 'phone :', brew.phone );
                    // console.log( 'extendedAddress :', brew.extendedAddress );
                    // console.log( 'streetAddress :', brew.streetAddress );
                    // console.log( 'city :', brew.city );
                    // console.log( 'state :', brew.state );
                    // console.log( 'zip :', brew.zip );
                    // console.log( 'country :', brew.country );
                    // console.log( 'website :', brew.website );
                    // console.log( 'locationType :', brew.locationType );
                    // console.log( 'distance :', brew.distance );
                    // console.log( 'icon :', brew.icon );
                    // console.log( 'latlon :', brew.latlon );
                    // console.log( 'icon :', brew.icon );
    },

    addMarker: function (brew) {
        // console.log( "Entered addMarker ", brew );
        // console.log( "Map : " , map );
        var icon = {
            url: brew.icon,
            scaledSize: new google.maps.Size(24, 24),
            origin: new google.maps.Point(0,0), 
            anchor: new google.maps.Point(0, 0)
        }
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng( brew.latitude, brew.longitude ), 
            icon: icon,
            map: mapper.map
        });

        // let contentString = "<div id='info-" + brew.breweryId +
        //                     "<p>" + brew.name + "</p>" +
        //                     "</div>";
    var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">' + brew.name + '</h1>'+
      '<div id="bodyContent">'+
      '<p>' + brew.description + '</p>'+
      '<p>Web site: <a href="' + brew.website + '" target="_blank">'+
       brew.website + '</a> '+
      '</p>'+
      '</div>'+
      '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        // marker.addListener('mouseover', function() {
        //     infowindow.open( mapper.map, marker);
        // });

        // marker.addListener('mouseout', function() {
        //     infowindow.close( mapper.map, marker );
        // });

        // New additions.
        marker.addListener('center_changed', function() {
          // 3 seconds after the center of the map has changed, pan back to the
          // marker.
          window.setTimeout(function() {
            marker.map.panTo(marker.getPosition());
          }, 2000);
        });

        marker.addListener('click', function() {
          marker.map.setCenter(marker.getPosition());
          infowindow.open(mapper.map, marker);
        });
    }
}

//var map;

mapper = {
    map: "",
    
    initMap: function(latitude, longitude) {

        var lat = latitude || 35.2271;
        var lng = longitude || -80.8431;

        mapper.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: new google.maps.LatLng(lat, lng),
            mapTypeId: 'roadmap',
            gestureHandling: 'cooperative'
        });
        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
        var icons = {
            parking: {
                icon: iconBase + 'parking_lot_maps.png'
            },
            brew: {
                icon: 'https://s3.amazonaws.com/brewerydbapi/brewery/78GQyY/upload_CKAsT7-icon.png',
              scale: 1
            },
            library: {
                icon: iconBase + 'library_maps.png'
            },
            info: {
                icon: iconBase + 'info-i_maps.png'
            }
        };

    },

    geolocation: function(){

       if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(function(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            mapper.map.setCenter(initialLocation);
               var pos = {
                   lat: position.coords.latitude,
                   lng: position.coords.longitude
               };

               geocoder = new google.maps.Geocoder();
               geocoder.geocode({'latLng': pos}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            for (j = 0; j < results[0].address_components.length; j++) {
                                if (results[0].address_components[j].types[0] == 'postal_code')
                                alert("Your zip code is: " + results[0].address_components[j].short_name);
                                var zipEntry = (results[0].address_components[j].short_name);
                                // console.log("zip: ", zipEntry);

                                // This will run the postal code API with the newly acquired zip code.
                                scr.getPostalCodes(zipEntry);

                                }
                            }
                        } else {
                            alert("Geocoder failed due to: " + status);
                        }
                });  
           }, function() {
               handleLocationError(true, infoWindow, map.getCenter());
           });
       } else {
           // Browser doesn't support Geolocation
           handleLocationError(false, infoWindow, map.getCenter());
       }
        var infoWindow = new google.maps.InfoWindow({
           map: map
       });
       function handleLocationError(browserHasGeolocation, infoWindow, pos) {
       // infoWindow.setPosition(pos);
       infoWindow.setContent(browserHasGeolocation ?
           'Error: The Geolocation service failed.' :
           'Error: Your browser doesn\'t support geolocation.');
        }               
    },
}
   //  // Try HTML5 geolocation.
   // if (navigator.geolocation) {
   //     navigator.geolocation.getCurrentPosition(function(position) {
   //         var pos = {
   //             lat: position.coords.latitude,
   //             lng: position.coords.longitude
   //         };

   //         infoWindow.setPosition(pos);
   //         infoWindow.setContent('Location found.');
   //         map.setCenter(pos);
   //     }, function() {
   //         handleLocationError(true, infoWindow, map.getCenter());
   //     });
   // } else {
   //     // Browser doesn't support Geolocation
   //     handleLocationError(false, infoWindow, map.getCenter());
   // }
   //  var infoWindow = new google.maps.InfoWindow({
   //     map: map
   // });
   // function handleLocationError(browserHasGeolocation, infoWindow, pos) {
   // infoWindow.setPosition(pos);
   // infoWindow.setContent(browserHasGeolocation ?
   //     'Error: The Geolocation service failed.' :
   //     'Error: Your browser doesn\'t support geolocation.');
   //  }
window.onload = function() {
    mapper.geolocation();
    
    searchChoice.submitListener();

    function reset () {
        $("#details").empty();
        $("#details").text("About");
    }

    $("#about").on("click", function(){
        $("#details").text("We'll help you find a place to get yo drink on!");
        setTimeout(reset, 3000);
    });

    $("#uberBtn").on("click", function(){
        console.log("Clicked!");
        setTimeout(function() {
            window.location = "https://itunes.com/apps/uber";
        }, 25);

        // If "custom-uri://" is registered the app will launch immediately and your
        // timer won't fire. If it's not set, you'll get an ugly "Cannot Open Page"
        // dialogue prior to the App Store application launching
        window.location = "custom-uri://";
    });

    $("#lyftBtn").on("click", function(){
        console.log("Clicked!");
        setTimeout(function() {
            window.location = "https://itunes.com/apps/lyft";
        }, 25);

        // If "custom-uri://" is registered the app will launch immediately and your
        // timer won't fire. If it's not set, you'll get an ugly "Cannot Open Page"
        // dialogue prior to the App Store application launching
        window.location = "custom-uri://";
    });

log.init();
}