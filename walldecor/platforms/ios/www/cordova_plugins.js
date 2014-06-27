cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.cesidiodibenedetto.filechooser/www/filechooser.js",
        "id": "com.cesidiodibenedetto.filechooser.FileChooser",
        "clobbers": [
            "FileChooser"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/CameraConstants.js",
        "id": "org.apache.cordova.camera.Camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/CameraPopoverOptions.js",
        "id": "org.apache.cordova.camera.CameraPopoverOptions",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/Camera.js",
        "id": "org.apache.cordova.camera.camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/ios/CameraPopoverHandle.js",
        "id": "org.apache.cordova.camera.CameraPopoverHandle",
        "clobbers": [
            "CameraPopoverHandle"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.cesidiodibenedetto.filechooser": "1.0.0",
    "org.apache.cordova.camera": "0.3.0"
}
// BOTTOM OF METADATA
});