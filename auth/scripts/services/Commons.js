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
        return 'http://www.gravatar.com/avatar/' + hash + '.jpg?d=mm';
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

    this.getIconHtmlExtension = function (extension) {
        if (extension && extensionIcons.indexOf(extension) !== -1) {
            var iconClass = extensionIcons[extension.toLowerCase()];
            if (iconClass) {
                return '<i class="fa ' + iconClass + '"/>';
            } else {
                return '<i class="fa fa-file-o" style="background:#FFF; content:' + extension.toUpperCase() + '"/>';
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

    this.states = [
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
    .filter('randomColor', [ 'Commons', function(Commons) {
        return function() {
            return Commons.pick(Commons.getColors(), 1)[0];
        };
    }]);
