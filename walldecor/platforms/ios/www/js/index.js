/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var environment = {
    version     : "4.0",
    build       : "4.0.21",
    environment : "test"
};

var channel = "albelli.nl";

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id)
    {
        loadApplication();
    }

};

// SHOWS THE PHOTO LIBRARY PHOTO SELECTOR
function choosePicture()
{
    navigator.camera.getPicture(onSuccess, onFail, {
        sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: Camera.DestinationType.FILE_URI
    });
}

// OPENS THE CAMERA AND ALLOWS USER TO TAKE A PICTURE
function takePicture()
{
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 40,
        destinationType: Camera.DestinationType.FILE_URI
    });
}


// ON SUCCESS
// put the selected image in the "placeholderImage" element, in order to make it available to the editor
function onSuccess(imageData) {
    var image = document.getElementById('placeholderImage');
    if ( image )
    { image.src = imageData; }
    
    document.getElementById("optionsArea").style.display = "none";
    
    launchEditor();
}


// ON ERROR
// returrn to page 2
function onFail(message) {
    alert('Failed because: ' + message);
    
    window.location.href = "page2.html";
}


// Launch the actual editor 
function launchEditor()
{
    var script = document.createElement( "script" );
    script.setAttribute( "type", "text/javascript" );
    script.setAttribute( "src", "assets/js/application.js" );
    
    document.getElementsByTagName( "head" )[ 0 ].appendChild( script );
}


// invoked after clicking "Preview" in editor
function previewProduct( b64image )
{
    alert( "FUCKIN' A!" );
    
    // creates <img> element (alternatively use b64image as ImageData and do some awesome shit)
    //var img = document.createElement( "img" );
    //img src = b64image;
    //document.body.appendChild( img ); // make it visible in DOM
}