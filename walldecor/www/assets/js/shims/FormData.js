/**
 * Shim for using FormData on <IE10
 * FormData
 */
var Basic =
{
    /**
     Gets the true type of the built-in object (better version of typeof).
     @author Angus Croll (http://javascriptweblog.wordpress.com/)

     @method typeOf
     @for Utils
     @static
     @param {Object} o Object to check.
     @return {String} Object [[Class]]
     */
    typeOf : function( o )
    {
        var undef;

        if (o === undef) {
            return 'undefined';
        } else if (o === null) {
            return 'null';
        } else if (o.nodeType) {
            return 'node';
        }

        // the snippet below is awesome, however it fails to detect null, undefined and arguments types in IE lte 8
        return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    },

    /**
     Executes the callback function for each item in array/object. If you return false in the
     callback it will break the loop.

     @method each
     @static
     @param {Object} obj Object to iterate.
     @param {function} callback Callback function to execute for each item.
     */
    each : function(obj, callback)
    {
        var length, key, i, undef;

        if (obj) {
            try {
                length = obj.length;
            } catch(ex) {
                length = undef;
            }

            if (length === undef) {
                // Loop object items
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (callback(obj[key], key) === false) {
                            return;
                        }
                    }
                }
            } else {
                // Loop array items
                for (i = 0; i < length; i++) {
                    if (callback(obj[i], i) === false) {
                        return;
                    }
                }
            }
        }
    }
};

function FormData()
{
    var _blobField, _fields = {}, _name = "";

    //Basic.extend(this, {
        /**
         Append another key-value pair to the FormData object

         @method append
         @param {String} name Name for the new field
         @param {String|Blob|Array|Object} value Value for the field
         */
        this.append = function(name, value) {
            var self = this, valueType = Basic.typeOf(value);

            if (value instanceof Blob) {
                if (_blobField) {
                    delete _fields[_blobField];
                }
                _blobField = name;
                _fields[name] = [value]; // unfortunately we can only send single Blob in one FormData
            } else if ('array' === valueType) {
                name += '[]';

                Basic.each(value, function(value) {
                    self.append.call(self, name, value);
                });
            } else if ('object' === valueType) {
                Basic.each(value, function(value, key) {
                    self.append.call(self, name + '[' + key + ']', value);
                });
            } else {
                value = value.toString(); // according to specs value might be either Blob or String

                if (!_fields[name]) {
                    _fields[name] = [];
                }
                _fields[name].push(value);
            }
        };

        /**
         Checks if FormData contains Blob.

         @method hasBlob
         @return {Boolean}
         */
        this.hasBlob = function() {
            return !!_blobField;
        };

        /**
         Retrieves blob.

         @method getBlob
         @return {Object} Either Blob if found or null
         */
        this.getBlob = function() {
            return _fields[_blobField] && _fields[_blobField][0] || null;
        };

        /**
         Retrieves blob field name.

         @method getBlobName
         @return {String} Either Blob field name or null
         */
        this.getBlobName = function() {
            return _blobField || null;
        };

        /**
         Loop over the fields in FormData and invoke the callback for each of them.

         @method each
         @param {Function} cb Callback to call for each field
         */
         this.each = function(cb) {
            Basic.each(_fields, function(value, name) {
                Basic.each(value, function(value) {
                    cb(value, name);
                });
            });
        };

        this.destroy = function() {
            _blobField = null;
            _name = "";
            _fields = {};
        };
    //});
}
