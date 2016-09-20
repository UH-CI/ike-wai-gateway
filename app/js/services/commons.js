angular.module('CommonsService', []).service('Commons', ['$rootScope', '$window', '$filter', 'md5', function ($rootScope, $window, $filter, md5) {

    this.isEmpty = function (item) {
        return !this.isNotEmpty(item);
    };

    this.isNotEmpty = function (item) {
        if (typeof item !== 'undefined' && item !== null && item !== '') {
            if (item.constructor === Array) {
                return item.length > 0;
            } else if (item instanceof Object) {
                return Object.keys(item).length > 0;
            } else {
                return true;
            }
        } else {
            return false;
        }
    };

    this.isString = function (stringVal) {
        return this.isNotEmpty(stringVal) && (typeof stringVal) === 'string';
    };

    this.isEmptyValueInArray = function (someArray) {
        for (var i in someArray) {
            if (angular.isObject(someArray[i])) {
                if (this.isEmptyValueInArray(this.toArray(someArray[i]))) {
                    return true;
                }
            } else if (angular.isArray(someArray[i])) {
                if (this.isEmptyValueInArray(someArray[i])) {
                    return true;
                }
            } else if (!someArray[i]) {
                return true;
            }
        }
        return false;
    };

    this.getSubOjectsInObjectArray = function (value, attr) {
        var values = [];
        angular.forEach(value, function (obj, key) {
            this.push(obj[attr]);
        }, values);

        return values;
    };

    this.formatPhoneNumber = function (phoneNumber) {
        var formattedPhoneNumber = '';
        if (this.isNotEmpty(phoneNumber)) {
            formattedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
            formattedPhoneNumber = formattedPhoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        }

        return formattedPhoneNumber;
    };

    /* Returns integer between min and max inclusive. */
    this.randomInt = function (min, max) {
        return (Math.floor(Math.random() * (max - min + 1)) + min);
    };

    this.randomDateString = function (year, month, day) {
        if (!year) {
            year = "2014";
        }
        if (!month) {
            month = this.randomInt(1, 12);
            if (month < 10) {
                month = "0" + month;
            }
        }
        if (!day) {
            day = this.randomInt(1, 28);
            if (day < 10) {
                day = "0" + day;
            }
        }
        return year + "-" + month + "-" + day + "T" + day + ":" + month + ":" + day + ".000Z";
    };

    /* Scrambles whatever you pass it and returns an array of shuffled values. */
    this.shuffle = function shuffle(o) {
        if (angular.isArray(o)) {
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        } else if (angular.isObject(o)) {
            return this.shuffle(this.toArray(o));
        } else {
            return this.shuffle(o.toString().split(''));
        }
    };

    this.toArray = function (obj) {
        if (angular.isArray(obj)) {
            return obj;
        } else if (angular.isObject(obj)) {
            var arr = [];
            for (var m in obj) {
                if (obj.hasOwnProperty(m)) {
                    arr.push(obj[m]);
                }
            }
            return arr;
        } else if (this.isNotEmpty(obj)) {
            return obj.toString().split();
        } else {
            return [];
        }
    };

    // Returns the set of the two arrays. Arrays may contain anything
    this.unique = function (array1, array2) {
        var a = this.toArray(array1).concat(this.toArray(array2));
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (angular.equals(a[i], a[j]))
                    a.splice(j--, 1);
            }
        }

        return a;
    };

    // Returns the first value of an array or object. Returns the first character
    // of a string, or first number of a numerical value, t for true, f for false.
    // note: object parameter ordering is not consistent, so this function is not
    // guaranteed to return the same result every time when called on an object.
    this.pop = function (objOrArray) {
        if (this.isNotEmpty(objOrArray)) {
            if (angular.isArray(objOrArray)) {
                return objOrArray[0];
            } else if (angular.isObject(objOrArray)) {
                return objOrArray[Object.keys(objOrArray)[0]];
            } else {
                return objOrArray.toString().substring(0, 1);
            }
        }
    };

    /* Picks count values from objOrArray at random and returs the in an array. */
    this.pick = function (count, objOrArray) {
        var picks = [];
        if (this.isNotEmpty(objOrArray)) {
            var shuffledObjOrArray = this.shuffle(objOrArray);
            picks = shuffledObjOrArray.slice(0, Math.min(count, shuffledObjOrArray.length));
        }

        return picks;
    };

    /* capitalizes the first letter of a string */
    this.capitalize = function (input, all) {
        return (!!input) ?
            input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })
            : '';
    };

    this.lowercase = function (s) {
        if (s) {
            return s.toLowerCase();
        }
        return s;
    };

    this.uppercase = function (s) {
        if (s) {
            return s.toUpperCase();
        }
        return s;
    };

    this.camelcaseToSentence = function (s) {
        if (s) {
            return s.replace(/^[a-z]|[A-Z]/g, function (v, i) {
                return i === 0 ? v.toUpperCase() : " " + v.toLowerCase();
            });
        }
        return this.capitalize(s);
    };

    this.snakecaseToSentence = function (s) {
        if (s) {
            return this.capitalize(s.replace(/_/g, ' '), true);
        }
        return this.capitalize(s, true);
    };

    /* Returns true if the needle exists in the haystack. Equality is tested
     using angular.equals. Needle and haystack may be anything.
     */
    this.contains = function (haystack, needle) {
        if (this.isEmpty(haystack)) return false;
        if (this.isEmpty(needle)) return false;
        if (angular.isArray(haystack)) {
            for (var i in haystack) {
                if (angular.equals(haystack[i], needle)) return true;
            }
            return false;
        } else if (angular.isObject(haystack)) {
            return (this.isNotEmpty($filter('filter')(haystack, needle, 'static')));
        } else {
            return (haystack.toString().indexOf(needle) !== -1);
        }
    };

    /* Generates a gravitar from the given email address. Defaults to 'Mystery Man'
     if no gravitar exists for the email address.
     */
    this.getGravitarFromEmail = function (email) {
        var hash = md5.createHash(email || '');
        return 'https://www.gravatar.com/avatar/' + hash + '.jpg?d=mm';
    };

    this.formatAddress = function (address) {
        var saddress = '<address>';

        if (this.isNotEmpty(address)) {
            var isFirst = true;
            if (this.isNotEmpty(address.poBox)) {
                saddress += '<span>PO Box ' + address.poBox + '</span>';
                isFirst = false;
            }
            if (this.isNotEmpty(address.street1)) {
                saddress += (isFirst ? '' : '<br/>') + '<span>' + address.street1 + '</span>';
                isFirst = false;
            }

            if (this.isNotEmpty(address.street2)) {
                saddress += (isFirst ? '' : '<br/>') + '<span>' + address.street2 + '</span>';
                isFirst = false;
            }

            if (this.isNotEmpty(address.city) || this.isNotEmpty(address.state) || this.isNotEmpty(address.zip)) {

                if (this.isNotEmpty(address.city)) {
                    saddress += (isFirst ? '' : '<br/>') + '<span>' + address.city;
                    if (this.isNotEmpty(address.state)) {
                        saddress += ', ' + address.state + '  ';
                    }
                } else if (this.isNotEmpty(address.state)) {
                    saddress += (isFirst ? '' : '<br/>') + '<span>' + address.state + '  ';
                }

                if (this.isNotEmpty(address.zip)) {
                    saddress += address.zip;
                }

                if (saddress !== '') {
                    saddress += '</span>';
                }
            }
        }

        return saddress + '</address>';

    };

    /* Sums values of "prop" field in each object contained within
     objectOrArray, where objectOrArray is an object or array. If
     prop is emptyish, this function attempts to sum the values
     of the array or object.
     */
    this.sum = function (objectOrArray, prop) {
        if (this.isNotEmpty(objectOrArray)) {
            if (objectOrArray.constructor === Array) {
                return objectOrArray.reduce(function (a, b) {
                    if (prop) {
                        return a + parseFloat(b[prop]);
                    } else {
                        return a + parseFloat(b);
                    }
                }, 0.0);
            } else {
                return this.sum(this.toArray(objectOrArray));
            }
        } else {
            return 0;
        }
    };

    this.booleanToYesNo = function (value) {
        if (this.isEmpty(value)) {
            return 'No';
        } else if (value === 1 || value === '1' || value === true) {
            return 'Yes';
        } else {
            return 'No';
        }
    };

    this.booleanToTrueFalse = function (value) {
        if (this.isEmpty(value)) {
            return 'False';
        } else if (value === 1 || value === '1' || value === true) {
            return 'True';
        } else {
            return 'False';
        }
    };

    this.htmlEncode = function (value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    this.htmlDecode = function (value) {
        return value
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    };

    var dict = {};
    this.setTransient = function (key, value) {
        dict[key] = value;
    };

    this.getTransient = function (key) {
        if (key in dict) {
            return dict[key];
        } else {
            return null;
        }
    };

    this.removeTransient = function (key) {
        delete(dict[key]);
    };

    this.clearTransients = function () {
        dict = {};
    };

    this.getFileExtension = function(filename) {
        return filename.substr((~-filename.lastIndexOf(".") >>> 0) + 2);
    };

    this.getFileTypeFontIconClass = function (filename) {
        var extension = this.getFileExtension(filename);
        return this.getIconHtmlExtension(extension, true);
    };

    this.getIconHtmlExtension = function (extension, onlyClass) {
        if (extension) {
            var iconClass = extensionIcons[extension.toLowerCase()];
            if (iconClass) {
                return onlyClass ? iconClass : '<i class="fa ' + iconClass + '"/>';
            } else {
                return onlyClass ? 'fa-file-alt' : '<i class="fa fa-file-alt" style="background:#FFF; content:' + extension.toUpperCase() + '"/>';
            }
        } else {
            return '<i class="fa fa-file-o"/>';
        }
    };

    var extensionIcons = {
        'parentdir': 'fa-level-up fa-flip-horizontal',
        'xls': 'fa-file-excel-o',
        'xlsx': 'fa-file-excel-o',
        'doc': 'fa-file-word-o',
        'docx': 'fa-file-word-o',
        'ppt': 'fa-file-powerpoint-o',
        'pptx': 'fa-file-powerpoint-o',
        'pdf': 'fa-file-pdf-o',
        'mpg4': " ",
        'hqx': 'fa-file-archive-o',
        'cpt': 'fa-file-archive-o',
        'csv': 'fa-file-code-o',
        'bin': 'fa-file-exe-o',
        'dms': '',
        'lha': '',
        'lzh': '',
        'exe': 'fa-file-exe-o',
        'class': 'fa-file-code-o',
        'psd': '',
        'so': '',
        'sea': '',
        'dll': 'fa-file-exe-o',
        'oda': '',
        'ai': '',
        'eps': '',
        'ps': '',
        'smi': '',
        'smil': '',
        'mif': 'fa-file-code-o',
        'wbxml': 'fa-file-code-o',
        'wmlc': 'fa-file-code-o',
        'dcr': 'fa-file-movie-o',
        'dir': 'fa-file-movie-o',
        'dxr': 'fa-file-movie-o',
        'dvi': 'fa-file-movie-o',
        'gtar': 'fa-file-archive-o',
        'gz': 'fa-file-archive-o',
        'php': 'fa-file-code-o',
        'php4': 'fa-file-code-o',
        'php3': 'fa-file-code-o',
        'phtml': 'fa-file-code-o',
        'phps': 'fa-file-code-o',
        'js': 'fa-file-code-o',
        'swf': 'fa-file-code-o',
        'sit': 'fa-file-archive-o',
        'tar': 'fa-file-archive-o',
        'tgz': 'fa-file-archive-o',
        'xhtml': 'fa-file-code-o',
        'xht': 'fa-file-code-o',
        'zip': 'fa-file-zip-o',
        'mid': 'fa-file-audio-o',
        'midi': 'fa-file-audio-o',
        'mpga': 'fa-file-audio-o',
        'mp2': 'fa-file-audio-o',
        'mp3': 'fa-file-audio-o',
        'aif': 'fa-file-audio-o',
        'aiff': 'fa-file-audio-o',
        'aifc': 'fa-file-audio-o',
        'ram': 'fa-file-audio-o',
        'rm': 'fa-file-audio-o',
        'rpm': 'fa-file-audio-o',
        'ra': 'fa-file-audio-o',
        'rv': 'fa-file-movie-o',
        'wav': 'fa-file-audio-o',
        'bmp': 'fa-file-image-o',
        'gif': 'fa-file-image-o',
        'jpeg': 'fa-file-image-o',
        'jpg': 'fa-file-image-o',
        'jpe': 'fa-file-image-o',
        'png': 'fa-file-image-o',
        'tiff': 'fa-file-image-o',
        'tif': 'fa-file-image-o',
        'css': 'fa-file-code-o',
        'html': 'fa-file-code-o',
        'htm': 'fa-file-code-o',
        'shtml': 'fa-file-code-o',
        'txt': 'fa-file-text-o',
        'text': 'fa-file-text-o',
        'log': 'fa-file-text-o',
        'rtx': 'fa-file-text-o',
        'rtf': 'fa-file-text-o',
        'xml': 'fa-file-code-o',
        'xsl': 'fa-file-code-o',
        'mpeg': 'fa-file-movie-o',
        'mpg': 'fa-file-movie-o',
        'mpe': 'fa-file-movie-o',
        'qt': 'fa-file-movie-o',
        'mov': 'fa-file-movie-o',
        'avi': 'fa-file-movie-o',
        'movie': 'fa-file-movie-o',
        'eml': '',
        'json': 'fa-file-code-o'
    };

    this.getStates = function() {
        return [
            {
                "name": "Alabama",
                "abbreviation": "AL"
            },
            {
                "name": "Alaska",
                "abbreviation": "AK"
            },
            {
                "name": "Arizona",
                "abbreviation": "AZ"
            },
            {
                "name": "Arkansas",
                "abbreviation": "AR"
            },
            {
                "name": "California",
                "abbreviation": "CA"
            },
            {
                "name": "Colorado",
                "abbreviation": "CO"
            },
            {
                "name": "Connecticut",
                "abbreviation": "CT"
            },
            {
                "name": "Delaware",
                "abbreviation": "DE"
            },
            {
                "name": "District Of Columbia",
                "abbreviation": "DC"
            },
            {
                "name": "Florida",
                "abbreviation": "FL"
            },
            {
                "name": "Georgia",
                "abbreviation": "GA"
            },
            {
                "name": "Hawaii",
                "abbreviation": "HI"
            },
            {
                "name": "Idaho",
                "abbreviation": "ID"
            },
            {
                "name": "Illinois",
                "abbreviation": "IL"
            },
            {
                "name": "Indiana",
                "abbreviation": "IN"
            },
            {
                "name": "Iowa",
                "abbreviation": "IA"
            },
            {
                "name": "Kansas",
                "abbreviation": "KS"
            },
            {
                "name": "Kentucky",
                "abbreviation": "KY"
            },
            {
                "name": "Louisiana",
                "abbreviation": "LA"
            },
            {
                "name": "Maine",
                "abbreviation": "ME"
            },
            {
                "name": "Maryland",
                "abbreviation": "MD"
            },
            {
                "name": "Massachusetts",
                "abbreviation": "MA"
            },
            {
                "name": "Michigan",
                "abbreviation": "MI"
            },
            {
                "name": "Minnesota",
                "abbreviation": "MN"
            },
            {
                "name": "Mississippi",
                "abbreviation": "MS"
            },
            {
                "name": "Missouri",
                "abbreviation": "MO"
            },
            {
                "name": "Montana",
                "abbreviation": "MT"
            },
            {
                "name": "Nebraska",
                "abbreviation": "NE"
            },
            {
                "name": "Nevada",
                "abbreviation": "NV"
            },
            {
                "name": "New Hampshire",
                "abbreviation": "NH"
            },
            {
                "name": "New Jersey",
                "abbreviation": "NJ"
            },
            {
                "name": "New Mexico",
                "abbreviation": "NM"
            },
            {
                "name": "New York",
                "abbreviation": "NY"
            },
            {
                "name": "North Carolina",
                "abbreviation": "NC"
            },
            {
                "name": "North Dakota",
                "abbreviation": "ND"
            },
            {
                "name": "Ohio",
                "abbreviation": "OH"
            },
            {
                "name": "Oklahoma",
                "abbreviation": "OK"
            },
            {
                "name": "Oregon",
                "abbreviation": "OR"
            },
            {
                "name": "Pennsylvania",
                "abbreviation": "PA"
            },
            {
                "name": "Rhode Island",
                "abbreviation": "RI"
            },
            {
                "name": "South Carolina",
                "abbreviation": "SC"
            },
            {
                "name": "South Dakota",
                "abbreviation": "SD"
            },
            {
                "name": "Tennessee",
                "abbreviation": "TN"
            },
            {
                "name": "Texas",
                "abbreviation": "TX"
            },
            {
                "name": "Utah",
                "abbreviation": "UT"
            },
            {
                "name": "Vermont",
                "abbreviation": "VT"
            },
            {
                "name": "Virginia",
                "abbreviation": "VA"
            },
            {
                "name": "Washington",
                "abbreviation": "WA"
            },
            {
                "name": "West Virginia",
                "abbreviation": "WV"
            },
            {
                "name": "Wisconsin",
                "abbreviation": "WI"
            },
            {
                "name": "Wyoming",
                "abbreviation": "WY"
            }
        ];
    };

    this.getCountries = function() {
        return [ // Taken from https://gist.github.com/unceus/6501985
            {
                name: 'Afghanistan',
                code: 'AF'
            }, {
                name: 'Åland Islands',
                code: 'AX'
            }, {
                name: 'Albania',
                code: 'AL'
            }, {
                name: 'Algeria',
                code: 'DZ'
            }, {
                name: 'American Samoa',
                code: 'AS'
            }, {
                name: 'Andorra',
                code: 'AD'
            }, {
                name: 'Angola',
                code: 'AO'
            }, {
                name: 'Anguilla',
                code: 'AI'
            }, {
                name: 'Antarctica',
                code: 'AQ'
            }, {
                name: 'Antigua and Barbuda',
                code: 'AG'
            }, {
                name: 'Argentina',
                code: 'AR'
            }, {
                name: 'Armenia',
                code: 'AM'
            }, {
                name: 'Aruba',
                code: 'AW'
            }, {
                name: 'Australia',
                code: 'AU'
            }, {
                name: 'Austria',
                code: 'AT'
            }, {
                name: 'Azerbaijan',
                code: 'AZ'
            }, {
                name: 'Bahamas',
                code: 'BS'
            }, {
                name: 'Bahrain',
                code: 'BH'
            }, {
                name: 'Bangladesh',
                code: 'BD'
            }, {
                name: 'Barbados',
                code: 'BB'
            }, {
                name: 'Belarus',
                code: 'BY'
            }, {
                name: 'Belgium',
                code: 'BE'
            }, {
                name: 'Belize',
                code: 'BZ'
            }, {
                name: 'Benin',
                code: 'BJ'
            }, {
                name: 'Bermuda',
                code: 'BM'
            }, {
                name: 'Bhutan',
                code: 'BT'
            }, {
                name: 'Bolivia',
                code: 'BO'
            }, {
                name: 'Bosnia and Herzegovina',
                code: 'BA'
            }, {
                name: 'Botswana',
                code: 'BW'
            }, {
                name: 'Bouvet Island',
                code: 'BV'
            }, {
                name: 'Brazil',
                code: 'BR'
            }, {
                name: 'British Indian Ocean Territory',
                code: 'IO'
            }, {
                name: 'Brunei Darussalam',
                code: 'BN'
            }, {
                name: 'Bulgaria',
                code: 'BG'
            }, {
                name: 'Burkina Faso',
                code: 'BF'
            }, {
                name: 'Burundi',
                code: 'BI'
            }, {
                name: 'Cambodia',
                code: 'KH'
            }, {
                name: 'Cameroon',
                code: 'CM'
            }, {
                name: 'Canada',
                code: 'CA'
            }, {
                name: 'Cape Verde',
                code: 'CV'
            }, {
                name: 'Cayman Islands',
                code: 'KY'
            }, {
                name: 'Central African Republic',
                code: 'CF'
            }, {
                name: 'Chad',
                code: 'TD'
            }, {
                name: 'Chile',
                code: 'CL'
            }, {
                name: 'China',
                code: 'CN'
            }, {
                name: 'Christmas Island',
                code: 'CX'
            }, {
                name: 'Cocos (Keeling) Islands',
                code: 'CC'
            }, {
                name: 'Colombia',
                code: 'CO'
            }, {
                name: 'Comoros',
                code: 'KM'
            }, {
                name: 'Congo',
                code: 'CG'
            }, {
                name: 'Congo, The Democratic Republic of the',
                code: 'CD'
            }, {
                name: 'Cook Islands',
                code: 'CK'
            }, {
                name: 'Costa Rica',
                code: 'CR'
            }, {
                name: 'Cote D\'Ivoire',
                code: 'CI'
            }, {
                name: 'Croatia',
                code: 'HR'
            }, {
                name: 'Cuba',
                code: 'CU'
            }, {
                name: 'Cyprus',
                code: 'CY'
            }, {
                name: 'Czech Republic',
                code: 'CZ'
            }, {
                name: 'Denmark',
                code: 'DK'
            }, {
                name: 'Djibouti',
                code: 'DJ'
            }, {
                name: 'Dominica',
                code: 'DM'
            }, {
                name: 'Dominican Republic',
                code: 'DO'
            }, {
                name: 'Ecuador',
                code: 'EC'
            }, {
                name: 'Egypt',
                code: 'EG'
            }, {
                name: 'El Salvador',
                code: 'SV'
            }, {
                name: 'Equatorial Guinea',
                code: 'GQ'
            }, {
                name: 'Eritrea',
                code: 'ER'
            }, {
                name: 'Estonia',
                code: 'EE'
            }, {
                name: 'Ethiopia',
                code: 'ET'
            }, {
                name: 'Falkland Islands (Malvinas)',
                code: 'FK'
            }, {
                name: 'Faroe Islands',
                code: 'FO'
            }, {
                name: 'Fiji',
                code: 'FJ'
            }, {
                name: 'Finland',
                code: 'FI'
            }, {
                name: 'France',
                code: 'FR'
            }, {
                name: 'French Guiana',
                code: 'GF'
            }, {
                name: 'French Polynesia',
                code: 'PF'
            }, {
                name: 'French Southern Territories',
                code: 'TF'
            }, {
                name: 'Gabon',
                code: 'GA'
            }, {
                name: 'Gambia',
                code: 'GM'
            }, {
                name: 'Georgia',
                code: 'GE'
            }, {
                name: 'Germany',
                code: 'DE'
            }, {
                name: 'Ghana',
                code: 'GH'
            }, {
                name: 'Gibraltar',
                code: 'GI'
            }, {
                name: 'Greece',
                code: 'GR'
            }, {
                name: 'Greenland',
                code: 'GL'
            }, {
                name: 'Grenada',
                code: 'GD'
            }, {
                name: 'Guadeloupe',
                code: 'GP'
            }, {
                name: 'Guam',
                code: 'GU'
            }, {
                name: 'Guatemala',
                code: 'GT'
            }, {
                name: 'Guernsey',
                code: 'GG'
            }, {
                name: 'Guinea',
                code: 'GN'
            }, {
                name: 'Guinea-Bissau',
                code: 'GW'
            }, {
                name: 'Guyana',
                code: 'GY'
            }, {
                name: 'Haiti',
                code: 'HT'
            }, {
                name: 'Heard Island and Mcdonald Islands',
                code: 'HM'
            }, {
                name: 'Holy See (Vatican City State)',
                code: 'VA'
            }, {
                name: 'Honduras',
                code: 'HN'
            }, {
                name: 'Hong Kong',
                code: 'HK'
            }, {
                name: 'Hungary',
                code: 'HU'
            }, {
                name: 'Iceland',
                code: 'IS'
            }, {
                name: 'India',
                code: 'IN'
            }, {
                name: 'Indonesia',
                code: 'ID'
            }, {
                name: 'Iran, Islamic Republic Of',
                code: 'IR'
            }, {
                name: 'Iraq',
                code: 'IQ'
            }, {
                name: 'Ireland',
                code: 'IE'
            }, {
                name: 'Isle of Man',
                code: 'IM'
            }, {
                name: 'Israel',
                code: 'IL'
            }, {
                name: 'Italy',
                code: 'IT'
            }, {
                name: 'Jamaica',
                code: 'JM'
            }, {
                name: 'Japan',
                code: 'JP'
            }, {
                name: 'Jersey',
                code: 'JE'
            }, {
                name: 'Jordan',
                code: 'JO'
            }, {
                name: 'Kazakhstan',
                code: 'KZ'
            }, {
                name: 'Kenya',
                code: 'KE'
            }, {
                name: 'Kiribati',
                code: 'KI'
            }, {
                name: 'Korea, Democratic People\'s Republic of',
                code: 'KP'
            }, {
                name: 'Korea, Republic of',
                code: 'KR'
            }, {
                name: 'Kuwait',
                code: 'KW'
            }, {
                name: 'Kyrgyzstan',
                code: 'KG'
            }, {
                name: 'Lao People\'s Democratic Republic',
                code: 'LA'
            }, {
                name: 'Latvia',
                code: 'LV'
            }, {
                name: 'Lebanon',
                code: 'LB'
            }, {
                name: 'Lesotho',
                code: 'LS'
            }, {
                name: 'Liberia',
                code: 'LR'
            }, {
                name: 'Libyan Arab Jamahiriya',
                code: 'LY'
            }, {
                name: 'Liechtenstein',
                code: 'LI'
            }, {
                name: 'Lithuania',
                code: 'LT'
            }, {
                name: 'Luxembourg',
                code: 'LU'
            }, {
                name: 'Macao',
                code: 'MO'
            }, {
                name: 'Macedonia, The Former Yugoslav Republic of',
                code: 'MK'
            }, {
                name: 'Madagascar',
                code: 'MG'
            }, {
                name: 'Malawi',
                code: 'MW'
            }, {
                name: 'Malaysia',
                code: 'MY'
            }, {
                name: 'Maldives',
                code: 'MV'
            }, {
                name: 'Mali',
                code: 'ML'
            }, {
                name: 'Malta',
                code: 'MT'
            }, {
                name: 'Marshall Islands',
                code: 'MH'
            }, {
                name: 'Martinique',
                code: 'MQ'
            }, {
                name: 'Mauritania',
                code: 'MR'
            }, {
                name: 'Mauritius',
                code: 'MU'
            }, {
                name: 'Mayotte',
                code: 'YT'
            }, {
                name: 'Mexico',
                code: 'MX'
            }, {
                name: 'Micronesia, Federated States of',
                code: 'FM'
            }, {
                name: 'Moldova, Republic of',
                code: 'MD'
            }, {
                name: 'Monaco',
                code: 'MC'
            }, {
                name: 'Mongolia',
                code: 'MN'
            }, {
                name: 'Montserrat',
                code: 'MS'
            }, {
                name: 'Morocco',
                code: 'MA'
            }, {
                name: 'Mozambique',
                code: 'MZ'
            }, {
                name: 'Myanmar',
                code: 'MM'
            }, {
                name: 'Namibia',
                code: 'NA'
            }, {
                name: 'Nauru',
                code: 'NR'
            }, {
                name: 'Nepal',
                code: 'NP'
            }, {
                name: 'Netherlands',
                code: 'NL'
            }, {
                name: 'Netherlands Antilles',
                code: 'AN'
            }, {
                name: 'New Caledonia',
                code: 'NC'
            }, {
                name: 'New Zealand',
                code: 'NZ'
            }, {
                name: 'Nicaragua',
                code: 'NI'
            }, {
                name: 'Niger',
                code: 'NE'
            }, {
                name: 'Nigeria',
                code: 'NG'
            }, {
                name: 'Niue',
                code: 'NU'
            }, {
                name: 'Norfolk Island',
                code: 'NF'
            }, {
                name: 'Northern Mariana Islands',
                code: 'MP'
            }, {
                name: 'Norway',
                code: 'NO'
            }, {
                name: 'Oman',
                code: 'OM'
            }, {
                name: 'Pakistan',
                code: 'PK'
            }, {
                name: 'Palau',
                code: 'PW'
            }, {
                name: 'Palestinian Territory, Occupied',
                code: 'PS'
            }, {
                name: 'Panama',
                code: 'PA'
            }, {
                name: 'Papua New Guinea',
                code: 'PG'
            }, {
                name: 'Paraguay',
                code: 'PY'
            }, {
                name: 'Peru',
                code: 'PE'
            }, {
                name: 'Philippines',
                code: 'PH'
            }, {
                name: 'Pitcairn',
                code: 'PN'
            }, {
                name: 'Poland',
                code: 'PL'
            }, {
                name: 'Portugal',
                code: 'PT'
            }, {
                name: 'Puerto Rico',
                code: 'PR'
            }, {
                name: 'Qatar',
                code: 'QA'
            }, {
                name: 'Reunion',
                code: 'RE'
            }, {
                name: 'Romania',
                code: 'RO'
            }, {
                name: 'Russian Federation',
                code: 'RU'
            }, {
                name: 'Rwanda',
                code: 'RW'
            }, {
                name: 'Saint Helena',
                code: 'SH'
            }, {
                name: 'Saint Kitts and Nevis',
                code: 'KN'
            }, {
                name: 'Saint Lucia',
                code: 'LC'
            }, {
                name: 'Saint Pierre and Miquelon',
                code: 'PM'
            }, {
                name: 'Saint Vincent and the Grenadines',
                code: 'VC'
            }, {
                name: 'Samoa',
                code: 'WS'
            }, {
                name: 'San Marino',
                code: 'SM'
            }, {
                name: 'Sao Tome and Principe',
                code: 'ST'
            }, {
                name: 'Saudi Arabia',
                code: 'SA'
            }, {
                name: 'Senegal',
                code: 'SN'
            }, {
                name: 'Serbia and Montenegro',
                code: 'CS'
            }, {
                name: 'Seychelles',
                code: 'SC'
            }, {
                name: 'Sierra Leone',
                code: 'SL'
            }, {
                name: 'Singapore',
                code: 'SG'
            }, {
                name: 'Slovakia',
                code: 'SK'
            }, {
                name: 'Slovenia',
                code: 'SI'
            }, {
                name: 'Solomon Islands',
                code: 'SB'
            }, {
                name: 'Somalia',
                code: 'SO'
            }, {
                name: 'South Africa',
                code: 'ZA'
            }, {
                name: 'South Georgia and the South Sandwich Islands',
                code: 'GS'
            }, {
                name: 'Spain',
                code: 'ES'
            }, {
                name: 'Sri Lanka',
                code: 'LK'
            }, {
                name: 'Sudan',
                code: 'SD'
            }, {
                name: 'Suriname',
                code: 'SR'
            }, {
                name: 'Svalbard and Jan Mayen',
                code: 'SJ'
            }, {
                name: 'Swaziland',
                code: 'SZ'
            }, {
                name: 'Sweden',
                code: 'SE'
            }, {
                name: 'Switzerland',
                code: 'CH'
            }, {
                name: 'Syrian Arab Republic',
                code: 'SY'
            }, {
                name: 'Taiwan, Province of China',
                code: 'TW'
            }, {
                name: 'Tajikistan',
                code: 'TJ'
            }, {
                name: 'Tanzania, United Republic of',
                code: 'TZ'
            }, {
                name: 'Thailand',
                code: 'TH'
            }, {
                name: 'Timor-Leste',
                code: 'TL'
            }, {
                name: 'Togo',
                code: 'TG'
            }, {
                name: 'Tokelau',
                code: 'TK'
            }, {
                name: 'Tonga',
                code: 'TO'
            }, {
                name: 'Trinidad and Tobago',
                code: 'TT'
            }, {
                name: 'Tunisia',
                code: 'TN'
            }, {
                name: 'Turkey',
                code: 'TR'
            }, {
                name: 'Turkmenistan',
                code: 'TM'
            }, {
                name: 'Turks and Caicos Islands',
                code: 'TC'
            }, {
                name: 'Tuvalu',
                code: 'TV'
            }, {
                name: 'Uganda',
                code: 'UG'
            }, {
                name: 'Ukraine',
                code: 'UA'
            }, {
                name: 'United Arab Emirates',
                code: 'AE'
            }, {
                name: 'United Kingdom',
                code: 'GB'
            }, {
                name: 'United States',
                code: 'US'
            }, {
                name: 'United States Minor Outlying Islands',
                code: 'UM'
            }, {
                name: 'Uruguay',
                code: 'UY'
            }, {
                name: 'Uzbekistan',
                code: 'UZ'
            }, {
                name: 'Vanuatu',
                code: 'VU'
            }, {
                name: 'Venezuela',
                code: 'VE'
            }, {
                name: 'Vietnam',
                code: 'VN'
            }, {
                name: 'Virgin Islands, British',
                code: 'VG'
            }, {
                name: 'Virgin Islands, U.S.',
                code: 'VI'
            }, {
                name: 'Wallis and Futuna',
                code: 'WF'
            }, {
                name: 'Western Sahara',
                code: 'EH'
            }, {
                name: 'Yemen',
                code: 'YE'
            }, {
                name: 'Zambia',
                code: 'ZM'
            }, {
                name: 'Zimbabwe',
                code: 'ZW'
            }
        ];
    };

    var charmap = {
        ' ': " ",
        '¡': "!",
        '¢': "c",
        '£': "lb",
        '¥': "yen",
        '¦': "|",
        '§': "SS",
        '¨': "\"",
        '©': "(c)",
        'ª': "a",
        '«': "<<",
        '¬': "not",
        '®': "(R)",
        '°': "^0",
        '±': "+/-",
        '²': "^2",
        '³': "^3",
        '´': "'",
        'µ': "u",
        '¶': "P",
        '·': ".",
        '¸': ",",
        '¹': "^1",
        'º': "o",
        '»': ">>",
        '¼': " 1/4 ",
        '½': " 1/2 ",
        '¾': " 3/4 ",
        '¿': "?",
        'À': "`A",
        'Á': "'A",
        'Â': "^A",
        'Ã': "~A",
        'Ä': '"A',
        'Å': "A",
        'Æ': "AE",
        'Ç': "C",
        'È': "`E",
        'É': "'E",
        'Ê': "^E",
        'Ë': '"E',
        'Ì': "`I",
        'Í': "'I",
        'Î': "^I",
        'Ï': '"I',
        'Ð': "D",
        'Ñ': "~N",
        'Ò': "`O",
        'Ó': "'O",
        'Ô': "^O",
        'Õ': "~O",
        'Ö': '"O',
        '×': "x",
        'Ø': "O",
        'Ù': "`U",
        'Ú': "'U",
        'Û': "^U",
        'Ü': '"U',
        'Ý': "'Y",
        'Þ': "Th",
        'ß': "ss",
        'à': "`a",
        'á': "'a",
        'â': "^a",
        'ã': "~a",
        'ä': '"a',
        'å': "a",
        'æ': "ae",
        'ç': "c",
        'è': "`e",
        'é': "'e",
        'ê': "^e",
        'ë': '"e',
        'ì': "`i",
        'í': "'i",
        'î': "^i",
        'ï': '"i',
        'ð': "d",
        'ñ': "~n",
        'ò': "`o",
        'ó': "'o",
        'ô': "^o",
        'õ': "~o",
        'ö': '"o',
        '÷': ":",
        'ø': "o",
        'ù': "`u",
        'ú': "'u",
        'û': "^u",
        'ü': '"u',
        'ý': "'y",
        'þ': "th",
        'ÿ': '"y',
        'Ā': "A",
        'ā': "a",
        'Ă': "A",
        'ă': "a",
        'Ą': "A",
        'ą': "a",
        'Ć': "'C",
        'ć': "'c",
        'Ĉ': "^C",
        'ĉ': "^c",
        'Ċ': "C",
        'ċ': "c",
        'Č': "C",
        'č': "c",
        'Ď': "D",
        'ď': "d",
        'Đ': "D",
        'đ': "d",
        'Ē': "E",
        'ē': "e",
        'Ĕ': "E",
        'ĕ': "e",
        'Ė': "E",
        'ė': "e",
        'Ę': "E",
        'ę': "e",
        'Ě': "E",
        'ě': "e",
        'Ĝ': "^G",
        'ĝ': "^g",
        'Ğ': "G",
        'ğ': "g",
        'Ġ': "G",
        'ġ': "g",
        'Ģ': "G",
        'ģ': "g",
        'Ĥ': "^H",
        'ĥ': "^h",
        'Ħ': "H",
        'ħ': "h",
        'Ĩ': "~I",
        'ĩ': "~i",
        'Ī': "I",
        'ī': "i",
        'Ĭ': "I",
        'ĭ': "i",
        'Į': "I",
        'į': "i",
        'İ': "I",
        'ı': "i",
        'Ĳ': "IJ",
        'ĳ': "ij",
        'Ĵ': "^J",
        'ĵ': "^j",
        'Ķ': "K",
        'ķ': "k",
        'Ĺ': "L",
        'ĺ': "l",
        'Ļ': "L",
        'ļ': "l",
        'Ľ': "L",
        'ľ': "l",
        'Ŀ': "L",
        'ŀ': "l",
        'Ł': "L",
        'ł': "l",
        'Ń': "'N",
        'ń': "'n",
        'Ņ': "N",
        'ņ': "n",
        'Ň': "N",
        'ň': "n",
        'ŉ': "'n",
        'Ō': "O",
        'ō': "o",
        'Ŏ': "O",
        'ŏ': "o",
        'Ő': '"O',
        'ő': '"o',
        'Œ': "OE",
        'œ': "oe",
        'Ŕ': "'R",
        'ŕ': "'r",
        'Ŗ': "R",
        'ŗ': "r",
        'Ř': "R",
        'ř': "r",
        'Ś': "'S",
        'ś': "'s",
        'Ŝ': "^S",
        'ŝ': "^s",
        'Ş': "S",
        'ş': "s",
        'Š': "S",
        'š': "s",
        'Ţ': "T",
        'ţ': "t",
        'Ť': "T",
        'ť': "t",
        'Ŧ': "T",
        'ŧ': "t",
        'Ũ': "~U",
        'ũ': "~u",
        'Ū': "U",
        'ū': "u",
        'Ŭ': "U",
        'ŭ': "u",
        'Ů': "U",
        'ů': "u",
        'Ű': '"U',
        'ű': '"u',
        'Ų': "U",
        'ų': "u",
        'Ŵ': "^W",
        'ŵ': "^w",
        'Ŷ': "^Y",
        'ŷ': "^y",
        'Ÿ': '"Y',
        'Ź': "'Z",
        'ź': "'z",
        'Ż': "Z",
        'ż': "z",
        'Ž': "Z",
        'ž': "z",
        'ſ': "s"
    };

    this.slugify = function (s) {
        if (!s) return "";
        var ascii = [];
        var ch, cp;
        for (var i = 0; i < s.length; i++) {
            if ((cp = s.charCodeAt(i)) < 0x180) {
                ch = String.fromCharCode(cp);
                ascii.push(charmap[ch] || ch);
            }
        }
        s = ascii.join("");
        s = s.replace(/[^\w\s-]/g, "").trim().toLowerCase();
        return s.replace(/[-\s]+/g, "-");
    };

    this.getColors = function() {
        return [
            "{white",
            "default",
            "dark",
            "blue",
            "blue-madison",
            "blue-chambray",
            "blue-ebonyclay",
            "blue-hoki",
            "blue-steel",
            "blue-soft",
            "blue-dark",
            "blue-sharp",
            "green",
            "green-meadow",
            "green-seagreen",
            "green-turquoise",
            "green-haze",
            "green-jungle",
            "green-soft",
            "green-dark",
            "green-sharp",
            "grey",
            "grey-steel",
            "grey-cararra",
            "grey-gallery",
            "grey-cascade",
            "grey-silver",
            "grey-salsa",
            "grey-salt",
            "grey-mint",
            "red",
            "red-pink",
            "red-sunglo",
            "red-intense",
            "red-thunderbird",
            "red-flamingo",
            "red-soft",
            "red-haze",
            "red-mint",
            "yellow",
            "yellow-gold",
            "yellow-casablanca",
            "yellow-crusta",
            "yellow-lemon",
            "yellow-saffron",
            "yellow-soft",
            "yellow-haze",
            "yellow-mint",
            "purple",
            "purple-plum",
            "purple-medium",
            "purple-studio",
            "purple-wisteria",
            "purple-seance",
            "purple-intense",
            "purple-sharp",
            "purple-soft"
        ]
    }
}])
    .filter('length', ['Commons', function (Commons) {
        return function (value) {
            if (value !== null) {
                return value.length;
            } else {
                return 0;
            }
        };
    }])
    .filter('capitalize', ['Commons', function (Commons) {
        return function (value) {
            return Commons.capitalize(value);
        };
    }])
    .filter('uppercase', ['Commons', function (Commons) {
        return function (value) {
            return Commons.uppercase(value);
        };
    }])
    .filter('lowercase', ['Commons', function (Commons) {
        return function (value) {
            return Commons.lowercase(value);
        };
    }])
    .filter('booleanToYesNo', ['Commons', function (Commons) {
        return function (value) {
            return Commons.booleanToYesNo(value);
        };
    }])
    .filter('booleanToTrueFalse', ['Commons', function (Commons) {
        return function (value) {
            return Commons.booleanToTrueFalse(value);
        };
    }])
    .filter('formatPhoneNumber', ['Commons', function (Commons) {
        return function (phoneNumber) {
            return Commons.formatPhoneNumber(phoneNumber);
        };
    }])
    .filter('formatAddress', ['Commons', function (Commons) {
        return function (address) {
            return Commons.formatAddress(address);
        };
    }])
    .filter('gravitar', ['Commons', function (Commons) {
        return function (email) {
            var gravitar = null;
            if (email) {
                gravitar = Commons.getGravitarFromEmail(email);
            }

            return gravitar;
        };
    }])
    .filter('findName', ['Commons', function (Commons) {
        return function (obj) {
            var formattedName = '';
            if (Commons.isNotEmpty(obj)) {
                if (Commons.isNotEmpty(obj.details)) {
                    if (Commons.isNotEmpty(obj.details.first_name) || Commons.isNotEmpty(obj.details.last_name)) {
                        formattedName = obj.details.first_name + ' ' + obj.details.last_name;
                    } else if (Commons.isNotEmpty(obj.details.name)) {
                        formattedName = obj.details.name;
                    }
                } else if (Commons.isNotEmpty(obj.name)) {
                    formattedName = obj.name;
                }
            }

            return formattedName;
        };
    }])
    .filter('formatStarRating', ['Commons', function (Commons) {
        return function (rating) {
            var sRating = '';
            if (Commons.isNotEmpty(rating)) {
                rating = parseFloat(rating);
                for (var i = 0; i < Math.floor(rating); i++) {
                    sRating += '<i class="fa fa-star text-yellow fa-fw"></i>';
                }
                var partialRating = rating - Math.floor(rating);
                if (partialRating > 0.5) {
                    sRating += '<i class="fa fa-star-half-o text-yellow fa-fw"></i>';
                } else if (partialRating > 0.25) {
                    sRating += '<i class="fa fa-star-half text-yellow fa-fw"></i>';
                } else if (partialRating > 0) {
                    sRating += '<i class="fa fa-star-o text-yellow fa-fw"></i>';
                }
            }

            return sRating;
        };
    }])
    .filter('contains', ['Commons', function (Commons) {
        return function (haystack, needle) {
            return Commons.contains(haystack, needle);
        };
    }])
    .filter('camelcaseToSentence', ['Commons', function (Commons) {
        return function (s) {
            return Commons.camelcaseToSentence(s);
        };
    }])
    .filter('snakecaseToSentence', ['Commons', function (Commons) {
        return function (s) {
            return Commons.snakecaseToSentence(s);
        };
    }])
    .filter('excerpt', function () {
        return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' ...');
        };
    })
    .filter('humanSize', function () {
        return function (size, precision, plainText) {

            if (precision === 0 || precision === null) {
                precision = 1;
            }
            if (size === 0 || size === null) {
                return "";
            }
            else if (!isNaN(size)) {
                var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                var posttxt = 0;

                if (size < 1024) {
                    if (plainText) {
                        return Number(size) + sizes[posttxt];
                    } else {
                        return Number(size) + '<font class="units">' + sizes[posttxt] + '</font>';
                    }
                }
                while (size >= 1024) {
                    posttxt++;
                    size = size / 1024;
                }

                var power = Math.pow(10, precision);
                var poweredVal = Math.ceil(size * power);

                size = poweredVal / power;

                if (plainText) {
                    return size + sizes[posttxt];
                } else {
                    return size + '<font class="units">' + sizes[posttxt] + '</font>';
                }
            } else {
                return "";
            }

        };
    })
    .filter('humanNumber', function () {
        return function (size, precision, plainText) {

            if (precision === 0 || precision === null) {
                precision = 1;
            }
            if (size === 0 || size === null) {
                return "";
            }
            else if (!isNaN(size)) {
                var sizes = ['', 'K', 'M', 'G', 'T'];
                var posttxt = 0;

                if (size < 1024) {
                    return Number(size);
                }
                while (size >= 1024) {
                    posttxt++;
                    size = size / 1024;
                }

                var power = Math.pow(10, precision);
                var poweredVal = Math.ceil(size * power);

                size = poweredVal / power;

                if (plainText) {
                    return size + sizes[posttxt];
                } else {
                    return size + '<font class="units">' + sizes[posttxt] + '</font>';
                }
            } else {
                return "";
            }

        };
    })
    .filter('fileIcon', ['Commons', function (Commons) {
        return function (extension) {
            return Commons.getIconHtmlExtension(extension);
        };
    }])
    .filter('phoneIcon', ['Commons', function (Commons) {
        return function (phoneType) {
            if (phoneType == 'mobile') {
                return 'fa-mobile';
            } else if (phoneType == 'work') {
                return 'fa-building-o';
            } else if (phoneType == 'fax') {
                return 'fa-fax';
            } else {
                return 'fa-phone';
            }
        };
    }])
    .filter('slugify', ['Commons', function (Commons) {
        return function (val) {
            return Commons.slugify(val);
        };
    }])
    .filter('filterStatusLabel', ['Commons', function (Commons) {
        return function (val) {
            return val === 'enabled' ? "label-success" : "label-danger";
        };
    }])
    .filter('range', function() {
        return function(input, total) {
            total = parseInt(total);

            for (var i=0; i<total; i++) {
                input.push(i);
            }

            return input;
        };
    })
    .filter('pickOne', [ 'Commons', function(Commons) {
        return function(input) {
            return Commons.pick(input, 1)[0];
        };
    }])
    .filter('newsicon', function() {
        return function(source) {
            if (source === 'twitter') {
                return 'fa fa-twitter';
            }
            else if (source === 'statusio') {
                return 'icon icon-statusio';
            }
            else {
                return 'icon icon-agave';
            }
        }
    });
