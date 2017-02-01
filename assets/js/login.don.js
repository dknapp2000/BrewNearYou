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

log.init();
