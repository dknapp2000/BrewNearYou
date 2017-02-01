var zips = {
    postalCodeURLTemplate: "https://www.zipcodeapi.com/rest/APIKEY/radius.json/ZIP-CODE/RADIUS/mile",
    radius: 5,
    dump: "",
    verbose: 1,

    zippyKeys: ['RZN3ICae8ONRQlyjw6beWMgFuIRqwMxnMkrvXBJ5qwXgSvAoCLDyyTd3C5t8S1vE',
        'bAef3NKEmCDbPs6umD45DED6FkV5QoF1YUg2H1H3DketNkX9X1fBGTIldDq42561',
        'o8jlRCuI5R54VHHfFdJ0QDToJmTT1u8pDsLu4fc97id2ZViF82FZFynoVhhWLqmo',
        'qhc4ldvTfxPKPGUnIkf95NKE5OwdodqPvCUQQpJ5WzPMgKaY4p79dSOiHkw5yWV3',
        'Am0KHtyA6RRAa2HdKTRzX7Ur2I55wTj7fkRWOqxVhowrqdFa6wK4DEwFnCLUv51K',
        'Dp4itMvJLMCG2Wd5zzwyTzgoM1EnMrdpRhIk4d3QZGw2CJ8biEKbe0A01eoNFCdw'
    ],


    keyTest: function(p_zipCode) {
        console.log("keyTest zipCode: " + p_zipCode);

        let kix = Math.floor(Math.random() * zips.zippyKeys.length);
        let key = zips.zippyKeys[kix];

        console.log("Key [" + kix + "] = " + key);

        for (var i = 0; i < zips.zippyKeys.length; i++) {
            zips.getPostalCodes(p_zipCode, 0, zips.zippyKeys[i]);
        }

    },

    getPostalCodes: function(p_zipCode, p_radius, p_apiKey) {
        let zipCode = p_zipCode;
        let radius = p_radius || zips.radius;
        let apiKey = p_apiKey || zips.zippyKeys[Math.floor(Math.random() * zips.zippyKeys.length)];
        let postalCodeURL = zips.postalCodeURLTemplate;

        console.log("Making the AJAX call, zip: " + p_zipCode + ", radius: " + p_radius + ",  key: " + p_apiKey);

        postalCodeURL = postalCodeURL.replace(/ZIP-CODE/, zipCode);
        postalCodeURL = postalCodeURL.replace(/RADIUS/, zips.radius);
        postalCodeURL = postalCodeURL.replace(/APIKEY/, apiKey);
        console.log(postalCodeURL);
        console.log();

        $.ajax(postalCodeURL)
            .done(function(data) {
            	console.log( JSON.stringify( data ) );
                var zips = data.zip_codes;
                scr.stepThroughZips( zips );
                console.log("Zips: ", zips);
            });
    },

    dump: function() {
    	console.log( zips );
    },
}


// zips.getPostalCodes('12303');
