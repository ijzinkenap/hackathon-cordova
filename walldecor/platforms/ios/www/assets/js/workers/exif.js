/**
 * (C) AlbumPrinter
 *
 * User: izinken
 * Date: 28/11/13 Time: 11:28
 *
 * a variant on the lib.image.exif.thirdparty.EXIF
 * note this only works with Blobs, not Images as they
 * are unavailable to the Worker
 */
self.addEventListener( "message", function( e )
{
    var data = e.data;
    switch ( data.cmd )
    {
        case "start":
            self.postMessage( "EXIF WORKER STARTED for ID : '" + data.id + "'" );
            EXIF.getData( base64toBlob( data.binary_string ), data.id );
            break;

        case "stop":
            self.postMessage( "EXIF WORKER STOPPED" );
            self.close(); // Terminates the worker.
            break;

        default:
            self.postMessage( "Unknown command: " + data.cmd );
    }

}, false );

/*
 * Javascript EXIF Reader 0.1.6
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */
var EXIF = (function() {

    var debug = false;

    /**
     * @private
     *
     * @typedef {{
     *              0x9000: string, 0xA000: string, 0xA001: string, 0xA002: string, 0xA003: string,
     *              0x9101: string, 0x9102: string, 0x927C: string, 0x9286: string, 0xA004: string,
     *              0x9003: string, 0x9004: string, 0x9290: string, 0x9291: string, 0x9292: string,
     *              0x829A: string, 0x829D: string, 0x8822: string, 0x8824: string, 0x8827: string,
     *              0x8828: string, 0x9201: string, 0x9202: string, 0x9203: string, 0x9204: string,
     *              0x9205: string, 0x9206: string, 0x9207: string, 0x9208: string, 0x9209: string,
     *              0x9214: string, 0x920A: string, 0xA20B: string, 0xA20C: string, 0xA20E: string,
     *              0xA20F: string, 0xA210: string, 0xA214: string, 0xA215: string, 0xA217: string,
     *              0xA300: string, 0xA301: string, 0xA302: string, 0xA401: string, 0xA402: string,
     *              0xA403: string, 0xA404: string, 0xA405: string, 0xA406: string, 0xA407: string,
     *              0xA408: string, 0xA409: string, 0xA40A: string, 0xA40B: string, 0xA40C: string,
     *              0xA005: string, 0xA420: string
     *          }}
     */
    var ExifTags = {

        // version tags
        0x9000 : "ExifVersion",			// EXIF version
        0xA000 : "FlashpixVersion",		// Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",			// Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",		// Valid width of meaningful image
        0xA003 : "PixelYDimension",		// Valid height of meaningful image
        0x9101 : "ComponentsConfiguration",	// Information about channels
        0x9102 : "CompressedBitsPerPixel",	// Compressed bits per pixel

        // user information
        0x927C : "MakerNote",			// Any desired information written by the manufacturer
        0x9286 : "UserComment",			// Comments by user

        // related file
        0xA004 : "RelatedSoundFile",		// Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",		// Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",		// Date and time when the image was stored digitally
        0x9290 : "SubsecTime",			// Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",		// Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",		// Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",		// Exposure time (in seconds)
        0x829D : "FNumber",			// F number
        0x8822 : "ExposureProgram",		// Exposure program
        0x8824 : "SpectralSensitivity",		// Spectral sensitivity
        0x8827 : "ISOSpeedRatings",		// ISO speed rating
        0x8828 : "OECF",			// Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",		// Shutter speed
        0x9202 : "ApertureValue",		// Lens aperture
        0x9203 : "BrightnessValue",		// Value of brightness
        0x9204 : "ExposureBias",		// Exposure bias
        0x9205 : "MaxApertureValue",		// Smallest F number of lens
        0x9206 : "SubjectDistance",		// Distance to subject in meters
        0x9207 : "MeteringMode", 		// Metering mode
        0x9208 : "LightSource",			// Kind of light source
        0x9209 : "Flash",			// Flash status
        0x9214 : "SubjectArea",			// Location and area of main subject
        0x920A : "FocalLength",			// Focal length of the lens in mm
        0xA20B : "FlashEnergy",			// Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",	//
        0xA20E : "FocalPlaneXResolution", 	// Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution", 	// Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit", 	// Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",		// Location of subject in image
        0xA215 : "ExposureIndex",		// Exposure index selected on camera
        0xA217 : "SensingMethod", 		// Image sensor type
        0xA300 : "FileSource", 			// Image source (3 == DSC)
        0xA301 : "SceneType", 			// Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",			// Color filter array geometric pattern
        0xA401 : "CustomRendered",		// Special processing
        0xA402 : "ExposureMode",		// Exposure mode
        0xA403 : "WhiteBalance",		// 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",		// Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",	// Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",		// Type of scene
        0xA407 : "GainControl",			// Degree of overall image gain adjustment
        0xA408 : "Contrast",			// Direction of contrast processing applied by camera
        0xA409 : "Saturation", 			// Direction of saturation processing applied by camera
        0xA40A : "Sharpness",			// Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",	//
        0xA40C : "SubjectDistanceRange",	// Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"		// Identifier assigned uniquely to each image
    };

    /**
     * @private
     *
     * @typedef {{
     *              0x0100: string, 0x0101: string, 0x8769: string, 0x8825: string, 0xA005: string, 0x0102: string,
     *              0x0103: string, 0x0106: string, 0x0112: string, 0x0115: string, 0x011C: string, 0x0212: string,
     *              0x0213: string, 0x011A: string, 0x011B: string, 0x0128: string, 0x0111: string, 0x0116: string,
     *              0x0117: string, 0x0201: string, 0x0202: string, 0x012D: string, 0x013E: string, 0x013F: string,
     *              0x0211: string, 0x0214: string, 0x0132: string, 0x010E: string, 0x010F: string, 0x0110: string,
     *              0x0131: string, 0x013B: string, 0x8298: string
     *          }}
     */
    var TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    /**
     * @private
     *
     * @typedef {{
     *              0x0000: string, 0x0001: string, 0x0002: string, 0x0003: string, 0x0004: string, 0x0005: string,
     *              0x0006: string, 0x0007: string, 0x0008: string, 0x0009: string, 0x000A: string, 0x000B: string,
     *              0x000C: string, 0x000D: string, 0x000E: string, 0x000F: string, 0x0010: string, 0x0011: string,
     *              0x0012: string, 0x0013: string, 0x0014: string, 0x0015: string, 0x0016: string, 0x0017: string,
     *              0x0018: string, 0x0019: string, 0x001A: string, 0x001B: string, 0x001C: string, 0x001D: string,
     *              0x001E: string
     *          }}
     */
    var GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

    /**
     * @private
     *
     * @typedef {{
     *              ExposureProgram: {0: string, 1: string, 2: string, 3: string, 4: string, 5: string, 6: string, 7: string, 8: string},
     *              MeteringMode: {0: string, 1: string, 2: string, 3: string, 4: string, 5: string, 6: string, 255: string},
     *              LightSource: {0: string, 1: string, 2: string, 3: string, 4: string, 9: string, 10: string, 11: string,
     *              12: string, 13: string, 14: string, 15: string, 17: string, 18: string, 19: string, 20: string, 21: string,
     *              22: string, 23: string, 24: string, 255: string}, Flash: {0x0000: string, 0x0001: string, 0x0005: string,
     *              0x0007: string, 0x0009: string, 0x000D: string, 0x000F: string, 0x0010: string, 0x0018: string, 0x0019: string,
     *              0x001D: string, 0x001F: string, 0x0020: string, 0x0041: string, 0x0045: string, 0x0047: string, 0x0049: string,
     *              0x004D: string, 0x004F: string, 0x0059: string, 0x005D: string, 0x005F: string},
     *              SensingMethod: {1: string, 2: string, 3: string, 4: string, 5: string, 7: string, 8: string},
     *              SceneCaptureType: {0: string, 1: string, 2: string, 3: string}, SceneType: {1: string},
     *              CustomRendered: {0: string, 1: string}, WhiteBalance: {0: string, 1: string},
     *              GainControl: {0: string, 1: string, 2: string, 3: string, 4: string}, Contrast: {0: string, 1: string, 2: string},
     *              Saturation: {0: string, 1: string, 2: string}, Sharpness: {0: string, 1: string, 2: string},
     *              SubjectDistanceRange: {0: string, 1: string, 2: string, 3: string}, FileSource: {3: string},
     *              Components: {0: string, 1: string, 2: string, 3: string, 4: string, 5: string, 6: string}
     *          }}
     */
    var StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    /**
     * @private
     *
     * @param {Element} element
     * @param {string} event
     * @param {!Function} handler
     */
    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    /**
     * @private
     *
     * @param {Blob} img
     * @return {boolean}
     */
    function imageHasData(img) {
        return !!(img.exifdata);
    }

    /**
     * @private
     *
     * @param {Blob} img
     * @param {string} id
     */
    function getImageData(img, id) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            img.exifdata = data || {};

            returnEXIF( img, id );
        }

        var fileReader = new FileReader();

        fileReader.onload = function( e )
        {
            handleBinaryFile( new BinaryFile( e.target.result ));
        };
        fileReader[ "readAsBinaryString" ]( /** @type {Blob} */ ( img ));
    }

    /**
     * @private
     *
     * @param {BinaryFile} file
     * @return {*}
     */
    function findEXIFinJPEG(file) {
        if (file.getByteAt(0) != 0xFF || file.getByteAt(1) != 0xD8) {
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.getLength(),
            marker;

        while (offset < length) {
            if (file.getByteAt(offset) != 0xFF) {
                if (debug) lib.debug.log("Not a valid marker at offset " + offset + ", found: " + file.getByteAt(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = file.getByteAt(offset+1);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 22400) {
                if (debug) lib.debug.log("Found 0xFFE1 marker");

                return readEXIFData(file, offset + 4, file.getShortAt(offset+2, true)-2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else if (marker == 225) {
                // 0xE1 = Application-specific 1 (for EXIF)
                if (debug) lib.debug.log("Found 0xFFE1 marker");

                return readEXIFData(file, offset + 4, file.getShortAt(offset+2, true)-2);

            } else {
                offset += 2 + file.getShortAt(offset+2, true);
            }

        }

    }

    /**
     * @public
     *
     * @param {BinaryFile} file
     * @param {number} tiffStart
     * @param {number} dirStart
     * @param {*} strings
     * @param {boolean} bigEnd
     *
     * @return {Object}
     */
    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getShortAt(dirStart, bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getShortAt(entryOffset, bigEnd)];
            if (!tag && debug) lib.debug.log("Unknown tag: " + file.getShortAt(entryOffset, bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }

    /**
     * @public
     *
     * @param {BinaryFile} file
     * @param {number} entryOffset
     * @param {number} tiffStart
     * @param {number} dirStart
     * @param {boolean} bigEnd
     *
     * @return {*}
     */
    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getShortAt(entryOffset+2, bigEnd),
            numValues = file.getLongAt(entryOffset+4, bigEnd),
            valueOffset = file.getLongAt(entryOffset+8, bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getByteAt(entryOffset + 8, bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getByteAt(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return file.getStringAt(offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getShortAt(entryOffset + 8, bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getShortAt(offset + 2*n, bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getLongAt(entryOffset + 8, bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getLongAt(valueOffset + 4*n, bigEnd);
                    }
                    return vals;
                }

            case 5:	// rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getLongAt(valueOffset, bigEnd);
                    denominator = file.getLongAt(valueOffset+4, bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getLongAt(valueOffset + 8*n, bigEnd);
                        denominator = file.getLongAt(valueOffset+4 + 8*n, bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getSLongAt(entryOffset + 8, bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getSLongAt(valueOffset + 4*n, bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getSLongAt(valueOffset, bigEnd) / file.getSLongAt(valueOffset+4, bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getSLongAt(valueOffset + 8*n, bigEnd) / file.getSLongAt(valueOffset+4 + 8*n, bigEnd);
                    }
                    return vals;
                }
        }
    }


    /**
     * @private
     *
     * @param {BinaryFile} file
     * @param {number} start
     * @param {...*} var_args
     *
     * @return {*}
     */
    function readEXIFData(file, start, var_args ) {
        if (file.getStringAt(start, 4) != "Exif") {
            if (debug) lib.debug.log("Not valid EXIF data! " + file.getStringAt(start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getShortAt(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getShortAt(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) lib.debug.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getShortAt(tiffOffset+2, bigEnd) != 0x002A) {
            if (debug) lib.debug.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        if (file.getLongAt(tiffOffset+4, bigEnd) != 0x00000008) {
            if (debug) lib.debug.log("Not valid TIFF data! (First offset not 8) > " + file.getShortAt(tiffOffset+4, bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset+8, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]]
                                + StringValues.Components[exifData[tag][1]]
                                + StringValues.Components[exifData[tag][2]]
                                + StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0]
                            + "." + gpsData[tag][1]
                            + "." + gpsData[tag][2]
                            + "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        return tags;
    }

    /**
     * @private
     *
     * @param {Blob} img
     * @param {string} id
     *
     * @return {boolean}
     */
    function getData(img, id) {
        if (!imageHasData(img)) {
            getImageData(img, id);
        } else {
            returnEXIF(img,id);
        }
        return true;
    }

    /**
     * @private
     *
     * @param {Blob} img
     * @param {string} tag
     *
     * @return {*}
     */
    function getTag(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    function getAllTags(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    /**
     * @public
     *
     * @param {Blob} img
     * @return {string}
     */
    function pretty(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    function returnEXIF( img, id )
    {
        self.postMessage({ "cmd" : "result", "id" : id, "data" : getAllTags( img ) });
    }

    /**
     * @public
     *
     * @param {BinaryFile} file
     * @return {*}
     */
    function readFromBinaryFile(file) {
        return findEXIFinJPEG(file);
    }

    return {
        readFromBinaryFile : readFromBinaryFile,
        pretty : pretty,
        getTag : getTag,
        getAllTags : getAllTags,
        getData : getData,

        Tags : ExifTags,
        TiffTags : TiffTags,
        GPSTags : GPSTags,
        StringValues : StringValues
    };

})();

/*
 * Binary Ajax 0.1.10
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */

/**
 * @constructor
 *
 * @param {string} strData
 * @param {number=} iDataOffset
 * @param {number=} iDataLength
 */
var BinaryFile = function( strData, iDataOffset, iDataLength )
{
    var data = strData;
    var dataOffset = iDataOffset || 0;
    var dataLength = 0;

    /**
     * @public
     *
     * @return {string}
     */
    this.getRawData = function() {
        return data;
    };

    if (typeof strData == "string")
    {
        dataLength = iDataLength || data.length;

        /**
         * @public
         *
         * @param {number} iOffset
         * @param {...*} var_args
         *
         * @returns {number}
         */
        this.getByteAt = function(iOffset, var_args) {
            return data.charCodeAt(iOffset + dataOffset) & 0xFF;
        };

        /**
         * @public
         *
         * @param {number} iOffset
         * @param {number} iLength
         *
         * @returns {Array.<number>}
         */
        this.getBytesAt = function(iOffset, iLength) {
            var aBytes = [];

            for (var i = 0; i < iLength; i++) {
                aBytes[i] = data.charCodeAt((iOffset + i) + dataOffset) & 0xFF
            }
            return aBytes;
        }
    } else if (typeof strData == "unknown") {
        dataLength = iDataLength || window[ "IEBinary_getLength" ](data);

        this.getByteAt = function(iOffset) {
            return window[ "IEBinary_getByteAt" ](data, iOffset + dataOffset);
        };

        this.getBytesAt = function(iOffset, iLength) {
            return new window[ "VBArray" ] ( window[ "IEBinary_getBytesAt" ](data, iOffset + dataOffset, iLength)).toArray();
        }
    }

    /**
     * @public
     *
     * @return {number}
     */
    this.getLength = function() {
        return dataLength;
    };

    /**
     * @public
     *
     * @param {number} iOffset
     * @return {number}
     */
    this.getSByteAt = function( iOffset )
    {
        var iByte = this.getByteAt( iOffset );

        if ( iByte > 127 ) {
            return iByte - 256;
        }
        else {
            return iByte;
        }
    };

    /**
     * @public
     *
     * @param {number} iOffset
     * @param {number|boolean=} bBigEndian
     * @return {number}
     */
    this.getShortAt = function(iOffset, bBigEndian) {
        var iShort = bBigEndian ?
            (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
            : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
        if (iShort < 0) iShort += 65536;
        return iShort;
    };

    /**
     * @public
     *
     * @param {number} iOffset
     * @param {number|boolean} bBigEndian
     * @return {number}
     */
    this.getSShortAt = function(iOffset, bBigEndian) {
        var iUShort = this.getShortAt(iOffset, bBigEndian);
        if (iUShort > 32767)
            return iUShort - 65536;
        else
            return iUShort;
    };

    /**
     * @public
     *
     * @param {number} iOffset
     * @param {number|boolean} bBigEndian
     *
     * @return {number}
     */
    this.getLongAt = function(iOffset, bBigEndian) {
        var iByte1 = this.getByteAt(iOffset),
            iByte2 = this.getByteAt(iOffset + 1),
            iByte3 = this.getByteAt(iOffset + 2),
            iByte4 = this.getByteAt(iOffset + 3);

        var iLong = bBigEndian ?
            (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
            : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
        if (iLong < 0) iLong += 4294967296;
        return iLong;
    };

    /**
     * @public
     *
     * @param {number} iOffset
     * @param {number|boolean} bBigEndian
     *
     * @return {number}
     */
    this.getSLongAt = function(iOffset, bBigEndian) {
        var iULong = this.getLongAt(iOffset, bBigEndian);
        if (iULong > 2147483647)
            return iULong - 4294967296;
        else
            return iULong;
    };

    /**
     * @public
     *
     * @param {number} iOffset
     * @param {number} iLength
     *
     * @return {string}
     */
    this.getStringAt = function(iOffset, iLength) {
        var aStr = [];

        var aBytes = this.getBytesAt(iOffset, iLength);
        for (var j=0; j < iLength; j++) {
            aStr[j] = String.fromCharCode(aBytes[j]);
        }
        return aStr.join("");
    };

    /**
     * @public
     *
     * @param {number} iOffset
     *
     * @return {string}
     */
    this.getCharAt = function(iOffset) {
        return String.fromCharCode(this.getByteAt(iOffset));
    };

    /**
     * @public
     * @return {string}
     */
    this.toBase64 = function() {
        return window.btoa(data);
    };

    /**
     * @public
     */
    this.fromBase64 = function(strBase64) {
        data = window.atob(strBase64);
    }
};

function base64toBlob( b64Data, contentType, sliceSize )
{
    contentType = contentType || "";
    sliceSize   = sliceSize   || 1024;

    // inner convenience function
    function charCodeFromCharacter( c )
    {
        return c.charCodeAt( 0 );
    }

    var byteCharacters;
    var byteArrays = [];

    // collect bytes from string data
    try
    {
        byteCharacters = atob( b64Data ).replace(/\s/g, '');
    }
    catch ( e )
    {
        // DOMException.INVALID_CHARACTER_ERR, most likely the
        // data wasn't base 64 encoded !! encode it here and try again
        // we check verty strictly for e.code as on iOS the stack looks
        // totally different when thrown from a Worker...

        if ( !e || !e.code || e.code === 5 )
        {
            byteCharacters = [];

            var p = 0;

            for (var i = 0; i < b64Data.length; i++) {
                var c = b64Data.charCodeAt(i);
                while (c > 0xff) {
                    byteCharacters[p++] = c & 0xff;
                    c >>= 8;
                }
                byteCharacters[p++] = c;
            }
        }
    }

    for ( var offset = 0; offset < byteCharacters.length; offset += sliceSize )
    {
        var slice       = byteCharacters.slice    ( offset, offset + sliceSize );
        var byteArray   = new Uint8Array( slice );

        // IMPORTANT : in most situations, the Uint8Array would suffice, but
        // in mobile Safari on iOS6 this would fail, miserably so !!
        byteArray = byteArray.buffer;

        byteArrays.push( byteArray );
    }

    return new Blob( byteArrays, { type: contentType });
}

// log message by posting it to parent application
function log( obj )
{
    self.postMessage({ "cmd" : "log", "data" : obj });
}


// overcomes the lack of Blob-functionality that may exist on the "Android Browser"

if ( navigator.userAgent.indexOf( "Linux; U; Android" ) !== -1 || !( "Blob" in self ))
{
    self["BlobBuilder"] = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder || (function() {
        var
            get_class = function(object) {
                return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
            }
            , FakeBlobBuilder = function BlobBuilder() {
                this.data = [];
            }
            , FakeBlob = function Blob(data, type, encoding) {
                this.data = data;
                this.size = data.length;
                this.type = type;
                this.encoding = encoding;
            }
            , FBB_proto = FakeBlobBuilder.prototype
            , FB_proto = FakeBlob.prototype
            , FileReaderSync = view.FileReaderSync
            , FileException = function(type) {
                this.code = this[this.name = type];
            }
            , file_ex_codes = (
                "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
                    + "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
                ).split(" ")
            , file_ex_code = file_ex_codes.length
            , real_URL = view.URL || view.webkitURL || view
            , real_create_object_URL = real_URL.createObjectURL
            , real_revoke_object_URL = real_URL.revokeObjectURL
            , URL = real_URL
            , btoa = view.btoa
            , atob = view.atob

            , ArrayBuffer = view.ArrayBuffer
            , Uint8Array = view.Uint8Array
            ;
        FakeBlob.fake = FB_proto.fake = true;
        while (file_ex_code--) {
            FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
        }
        if (!real_URL.createObjectURL) {
            URL = view.URL = {};
        }
        URL.createObjectURL = function(blob) {
            var
                type = blob.type
                , data_URI_header
                ;
            if (type === null) {
                type = "application/octet-stream";
            }
            if (blob instanceof FakeBlob) {
                data_URI_header = "data:" + type;
                if (blob.encoding === "base64") {
                    return data_URI_header + ";base64," + blob.data;
                } else if (blob.encoding === "URI") {
                    return data_URI_header + "," + decodeURIComponent(blob.data);
                } if (btoa) {
                    return data_URI_header + ";base64," + btoa(blob.data);
                } else {
                    return data_URI_header + "," + encodeURIComponent(blob.data);
                }
            } else if (real_create_object_URL) {
                return real_create_object_URL.call(real_URL, blob);
            }
        };
        URL.revokeObjectURL = function(object_URL) {
            if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
                real_revoke_object_URL.call(real_URL, object_URL);
            }
        };
        FBB_proto.append = function(data/*, endings*/) {
            var bb = this.data;
            // decode data to a binary string
            if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
                var
                    str = ""
                    , buf = new Uint8Array(data)
                    , i = 0
                    , buf_len = buf.length
                    ;
                for (; i < buf_len; i++) {
                    str += String.fromCharCode(buf[i]);
                }
                bb.push(str);
            } else if (get_class(data) === "Blob" || get_class(data) === "File") {
                if (FileReaderSync) {
                    var fr = new FileReaderSync;
                    bb.push(fr.readAsBinaryString(data));
                } else {
                    // async FileReader won't work as BlobBuilder is sync
                    throw new FileException("NOT_READABLE_ERR");
                }
            } else if (data instanceof FakeBlob) {
                if (data.encoding === "base64" && atob) {
                    bb.push(atob(data.data));
                } else if (data.encoding === "URI") {
                    bb.push(decodeURIComponent(data.data));
                } else if (data.encoding === "raw") {
                    bb.push(data.data);
                }
            } else {
                if (typeof data !== "string") {
                    data += ""; // convert unsupported types to strings
                }
                // decode UTF-16 to binary string
                bb.push(unescape(encodeURIComponent(data)));
            }
        };
        FBB_proto.getBlob = function(type) {
            if (!arguments.length) {
                type = null;
            }
            return new FakeBlob(this.data.join(""), type, "raw");
        };
        FBB_proto.toString = function() {
            return "[object BlobBuilder]";
        };
        FB_proto.slice = function(start, end, type) {
            var args = arguments.length;
            if (args < 3) {
                type = null;
            }
            return new FakeBlob(
                this.data.slice(start, args > 1 ? end : this.data.length)
                , type
                , this.encoding
            );
        };
        FB_proto.toString = function() {
            return "[object Blob]";
        };
        return FakeBlobBuilder;
    }(view));

    self["Blob"] = function(blobParts, options) {
        var type = options ? (options.type || "") : "";
        var builder = new self["BlobBuilder"]();
        if (blobParts) {
            for (var i = 0, len = blobParts.length; i < len; i++) {
                builder.append(blobParts[i]);
            }
        }
        return builder.getBlob(type);
    };

}
