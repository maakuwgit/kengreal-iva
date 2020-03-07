/*
*   IVA Helper - Veeva
*
*   Utility functions for working with IVAs - Veeva version.
*
*   This file includes the "properties" object and global framework variables (ie - touchClick)
*   This file includes Veeva shortcuts for navigation and tracking
*   This file includes shortcut methods for localStorage and more
*
*   Copyright (c) 2015 AbelsonTaylor, Inc
*   http://www.abelsontaylor.com
*/

/*

    Need to add method for Approved Email:

    com.veeva.clm.launchApprovedEmail(email_template, email_fragments, callback) 

*/


var touchClick,
    properties,
    iva,
    isVault = false;

if(iva == null) iva = {};

(function($) {

    var scriptPath  = thisPath();

    properties = {
        stage: Object.freeze({ "width": $(window).width(), "height": $(window).height() }),
        detailInfo: {
            // MUST include properties for the presentation within this object.
            // Can be included here, but prefered method includes external config file.
            // Call external file using iva.config() method.
            //
            // "slides" : [
            //     {
            //         "arch" :    "A05",
            //         "title":    "Home",
            //         "mobile":   "AT-Demo-Brand-Home.zip",
            //         "local":    "../AT-Demo-Brand-Home/AT-Demo-Brand-Home.html"
            //     }
            // ],
            // "presentationName": "AT-Demo-Brand",
            // "presentationID": "AT-Demo-Brand"
        }
    };

    iva = {

        init: function() {

            /* Set interaction type based on device capabilities */
            if(touchClick == null) {
                touchClick = (iva.isIOS()) ? 'touchstart' : (iva.isWin()) ? 'pointerup' : 'click';
            }

            /* Fix Veeva issue where slide scrolls veritcally in player */
            $(document).ready(function() {
                
                $(document).on('touchmove', function( e ){ e.preventDefault(); });
            
            });

        },

        config: function( path ) {

            $.ajax({
                type: "GET",
                url: path,
                dataType: "json",
                async: false,
            }).fail(function(result){

                throw new Error(result.statusText);

            }).done(function(data){
                
                properties['detailInfo'] = data;
               
            });
        },

        // REMOVE?! Added to debug on the iPad
        error: function(){
            window.onerror = function (errorMsg, url, lineNumber) {
                alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
            }
        },

        // Orientation

        rotate: function(){
            var ivaOrientation = (Math.abs(window.orientation) === 90) ? "landscape" : "portrait";

            return ivaOrientation;
        },

        orientation: function(callbackMethod, bool){
            var portraitCheck, ivaOrientation,
                callback = (typeof callbackMethod === "function") ? callbackMethod : null,
                listener = bool;

            if(window.matchMedia){
                portraitCheck = window.matchMedia("(orientation: portrait)");
                if(listener){
                    portraitCheck.addListener(setOrientationValue);
                }

                ivaOrientation = (portraitCheck.matches) ? "portrait" : "landscape";

                function setOrientationValue(mediaQueryList) {
                    ivaOrientation = (mediaQueryList.matches) ? "portrait" : "landscape";
                    if(callback !== null){
                        callback( ivaOrientation );
                    } else {
                        return ivaOrientation;
                    }
                }

                if(callback !== null){
                    callback( ivaOrientation );
                } else { 
                    return ivaOrientation;
                }

            } else {
                console.log("matchMedia not supported");
                return false;
            }

        },


        geo: function(callbackMethod){
            var callback = (typeof callbackMethod === "function") ? callbackMethod : null;

            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(success, error);

                function success(position) {
                    // Get the positioning coordinates.
                    var location = {};

                    location.accuracy = position.coords.accuracy;
                    location.latitude = position.coords.latitude;
                    location.longitude = position.coords.longitude;


                    if(callback !== null){
                        callback( location );
                    } else {
                        return location;
                    }

                }

                function error(message){
                    console.log(message);
                }

            } else {
                alert("Geolocation is not supported.");
                return;
            }
        },


        /* Veeva gotoSlide shortcut method
        params:     object containing keyMessage 'and' CLM Presentation
            'keymessage':   KeyMessage name, including .zip extension
            'presentation': CLM Presentation ID. Only required if switching presentations
            iva.navigateToSlide({keymessage: 'keymessage_filename', presentation: ''})
        */
        navigateToSlide: function(params) {
            if(iva.isIOS() || iva.isWin()){
                var loc = params.presentation ? params.keymessage + ', ' + params.presentation : params.keymessage;
                if(isVault){
                    com.veeva.clm.gotoSlideV2(loc);
                } else {
                    com.veeva.clm.gotoSlide(loc);
                }
            } else {
                window.location = params.keymessage;
            }
        },

        /*
        Veeva nextSlide shortcut method
        params:     if empty defaults to nextSlide method, else navigateToSlide
        */
        navigateNext: function(params) {
            if(!params){
                request = "veeva:nextSlide()";
                com.veeva.clm.runAPIRequest(request);
            } else {
                iva.navigateToSlide(params);
            }
        },
        
        /*
        Veeva previousSlide shortcut method
        params:     if empty defaults to previoudSlide method, else navigateToSlide
        */
        navigatePrevious: function(params) {
            if(!params){
                request = "veeva:prevSlide()";
                com.veeva.clm.runAPIRequest(request);
            } else {
                iva.navigateToSlide(params);
            }
        },

        /***
        Bind this function to the event you need to track and pass the necessary parameters:
        ***/
        // Creates a new record for the specified object
        // clmType:    Type of interaction event (tab, modal, etc.)
        // clmDesc:    Unique description of type (such as name specific to tab or button)
        // clmID:      iRep: SLIDE/TAB Unique ID
        // NOTE: This function returns success: true as long as the user has access to the object.
        //       If the user does not have access to one of the fields specified, success: true is still returned, however,
        //       and the fields the user does have access to are still updated.

        track: function( clmType, clmDesc, clmID, clmCB ) {
            var clm_callback = (typeof clmCB === 'function') ? clmCB : iva.createRecordCallback;
            if( iva.isIOS() ) {   // Ignore desktops
                var clickStream = {};

                clickStream.Track_Element_Id_vod__c = clmID;
                clickStream.Track_Element_Type_vod__c = clmType;
                clickStream.Selected_Items_vod__c = clmDesc;
                clickStream.Track_Element_Description_vod__c = clmDesc;

                var myJSONText = JSON.stringify( clickStream );

                try {
                    request = com.veeva.clm.createRecord( Call_Clickstream_vod__c, myJSONText, clm_callback );
                }
                catch( f ) {
                    request = "veeva:saveObject(Call_Clickstream_vod__c),value(" + myJSONText + "),callback(clm_callback)";
                    document.location = request;
                }
            } else {
                console.log( "clickStream.Track_Element_Id_vod__c: " + clmID );
                console.log( "clickStream.Track_Element_Type_vod__c: " + clmType );
                console.log( "clickStream.Selected_Items_vod__c: " + clmDesc );
                console.log( "clickStream.Track_Element_Description_vod__c: " + clmDesc );
            }
        },

        /***
        Callback from iva.track.  Will run after saveObject or createRecord have been called.
        Will run regardless of success or failure of veeva function.
        result      // object with veeva information specific to function
        ***/
        createRecordCallback: function( result ) {
            if( !( result.success ) ) {
                // I've got nothing.
            }
        },

        dataLoad: function( loadURL, dataType, dest, append ){
            var loadType = (!dataType) ? "json" : dataType,
                loadDest = (!dest) ? null : dest,
                loadSet = (!append) ? 'overwrite' : 'append',
                newData;

            $.ajax({
                type: "GET",
                url: loadURL,
                dataType: loadType
            }).fail(function(result){
                throw new Error(result.statusText);
            }).done(function(data){
                newData = data;
                $(loadDest).append(newData);
                // if (loadDest !== null) {
                //     (loadSet == "overwrite") ? loadDest.html(newData) : loadDest.append(newData);
                // } else {
                //     return newData;
                // }

            });

        },

        /* Check if on iPad/touch device */
        isIOS: function() {
            return "ontouchstart" in document.documentElement;
        },

        /* Additional check to test if on Windows device */
        isWin: function() {
            return window.navigator.pointerEnabled;
        },

        /* Check if browser is online */
        isOnline: function() {
            if('onLine' in navigator) {
                return navigator.onLine;
            } else {
                alert("Online detection feature not availble.");
                return false;
            }
        },

        /*
        localStorage methods
        */
        store: {
            
            get: function (key) {
               return JSON.parse(localStorage.getItem(key));
            },

            save: function (key, data) {
               localStorage.setItem(key, JSON.stringify(data));
               return data;
            },

            remove: function (key) {
                localStorage.removeItem(key);
            },
            
            clearAll: function () {
                localStorage.clear();
            }
        
        },

        /*
        sessionStorage methods
        */
        session: {
            
            get: function (key) {
               return JSON.parse(sessionStorage.getItem(key));
            },

            save: function (key, data) {
               sessionStorage.setItem(key, JSON.stringify(data));
               return data;
            },

            remove: function (key) {
                sessionStorage.removeItem(key);
            },
            
            clearAll: function () {
                sessionStorage.clear();
            }
        
        },

        contact: {

            loadName: function() {
                // $('#errmsg').hide();
                com.veeva.clm.getDataForCurrentObject("Account","Name",iva.contact.showName); // result.Account.Name
            },

            showName: function(result){
                alert(result.Account.Name);
                // var NameHTML=document.getElementById("account_name");
                // NameHTML.innerHTML+=result.Account.Name+"<br>";
                // com.veeva.clm.getDataForCurrentObject("Account","Preferred_Name_vod__c",showPreferredName);
            },

            showPreferredName: function(result){
                var PreferredNameHTML=document.getElementById("preferred_name");
                if(result.Account.Preferred_Name_vod__c==""){
                    PreferredNameHTML.innerHTML+="Preferred Name: NULL";
                }else{
                    PreferredNameHTML.innerHTML+="Preferred Name: " + result.Account.Preferred_Name_vod__c+"<br>";
                }
                com.veeva.clm.getDataForCurrentObject("Account","PersonEmail",showPersonEmail);
            }

        }

    };

    function thisPath() {
        var scriptPath = document.getElementsByTagName("script"); 
        scriptPath = scriptPath[scriptPath.length-1].src;
        scriptPath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
        return scriptPath+'/';
    }

    iva.init();

})(jQuery);

    function errorMessage(msg) {
        // $('#errmsg').show();
        // hideLoader();
        if(msg){
            alert("Oops: " + msg);
        } else {
            alert("Oops");
        }
    }

    function fileName(fileStr) {
        if (typeof (fileStr) != "string")
            return;
        
        var fileArray = fileStr.split('.'),
            numSegs = fileArray.length;
        
        if (numSegs<=1) 
            return; 
        
        return fileArray[0];
    }
