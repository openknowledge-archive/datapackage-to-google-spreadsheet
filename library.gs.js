/**
Usage:

1. In your spreadsheet open the script editor to create a new script

2. Include this library. To do this
  
  1. go to Resources => Manage Resources
  2. Use the project id:
  
MH6zwb-_fUDq8QyPrl-PbJlu_4T1jeIs_

More detailed instructions on using a library https://developers.google.com/apps-script/guide_libraries#useLibrary

3. Copy and paste the following into your script and hit save:

function onOpen() {
  DataPackages.onOpen();
}

function importDataPackageUi() {
  DataPackages.importDataPackageUi();
}

4. Hit run.

5. There is now a new Data Packages menu in your spreadsheet. whenever you open spreadsheets in future it will be there.
*/

function importDataPackageUi() {
  var url = Browser.inputBox('Import a Data Package', 'Data package URL', Browser.Buttons.OK_CANCEL);
  if (url != 'cancel') {
    importDataPackage(url);
  }
}

/**
 * Import a Simple Data Format into this spreadsheet.
 * @param url: the url to the data package (base directory or datapackage.json)
 */
function importDataPackage(url) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var response = UrlFetchApp.fetch(url);
  var content = response.getContentText();
  var dpjson = Utilities.jsonParse(content);
  // Logger.log(dpjson);
  if (dpjson.resources && dpjson.resources.length > 0) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var furl = getFileUrl(dpjson.resources[0], url);
    var res = UrlFetchApp.fetch(furl);
    var csv = res.getContentText();
    var data = parseCsv(csv);
    setRowsData(sheet, data);
  }
};

function getFileUrl(fileInfo, dpJsonUrl) {
  if (fileInfo.url) return fileInfo.url;
  else {
    var base = dpJsonUrl.slice(0, dpJsonUrl.length - 'datapackage.json'.length);
    return base + fileInfo['path'];
  }
}

function setRowsData(sheet, data, optFirstDataRowIndex, optFirstColIndex) {
  var firstDataRowIndex = optFirstDataRowIndex || 1;
  var firstColRowIndex = optFirstColIndex || 1;

  var destinationRange = sheet.getRange(firstDataRowIndex, 1,
                                        data.length, data[0].length);
  destinationRange.setValues(data);
}

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Import Data",
    functionName : "importDataPackageUi"
  }];
  sheet.addMenu("Data Packages", entries);
};

// ## parseCSV
  //
  // Converts a Comma Separated Values string into an array of arrays.
  // Each line in the CSV becomes an array.
  //
  // Empty fields are converted to nulls and non-quoted numbers are converted to integers or floats.
  //
  // @return The CSV parsed as an array
  // @type Array
  // 
  // @param {String} s The string to convert
  // @param {Object} options Options for loading CSV including
  // 	  @param {Boolean} [trim=false] If set to True leading and trailing
  // 	    whitespace is stripped off of each non-quoted field as it is imported
  //	  @param {String} [delimiter=','] A one-character string used to separate
  //	    fields. It defaults to ','
  //    @param {String} [quotechar='"'] A one-character string used to quote
  //      fields containing special characters, such as the delimiter or
  //      quotechar, or which contain new-line characters. It defaults to '"'
  //
  // Heavily based on uselesscode's JS CSV parser (MIT Licensed):
  // http://www.uselesscode.org/javascript/csv/
parseCsv = function(s, options) {
  function chomp(s) {
    if (s.charAt(s.length - 1) !== "\n") {
      // Does not end with \n, just return string
      return s;
    } else {
      // Remove the \n
      return s.substring(0, s.length - 1);
    }
  }
  
  var rxIsInt = /^\d+$/,
    rxIsFloat = /^\d*\.\d+$|^\d+\.\d*$/,
    // If a string has leading or trailing space,
    // contains a comma double quote or a newline
    // it needs to be quoted in CSV output
    rxNeedsQuoting = /^\s|\s$|,|"|\n/,
    trim = (function () {
      // Fx 3.1 has a native trim function, it's about 10x faster, use it if it exists
      if (String.prototype.trim) {
        return function (s) {
          return s.trim();
        };
      } else {
        return function (s) {
          return s.replace(/^\s*/, '').replace(/\s*$/, '');
        };
      }
    }());
  
    // Get rid of any trailing \n
    s = chomp(s);

    var options = options || {};
    var trm = (options.trim === false) ? false : true;
    var delimiter = options.delimiter || ',';
    var quotechar = options.quotechar || '"';

    var cur = '', // The character we are currently processing.
      inQuote = false,
      fieldQuoted = false,
      field = '', // Buffer for building up the current field
      row = [],
      out = [],
      i,
      processField;

    processField = function (field) {
      if (fieldQuoted !== true) {
        // If field is empty set to null
        if (field === '') {
          field = null;
        // If the field was not quoted and we are trimming fields, trim it
        } else if (trm === true) {
          field = trim(field);
        }

        // Convert unquoted numbers to their appropriate types
        if (rxIsInt.test(field)) {
          field = parseInt(field, 10);
        } else if (rxIsFloat.test(field)) {
          field = parseFloat(field, 10);
        }
      }
      return field;
    };

    for (i = 0; i < s.length; i += 1) {
      cur = s.charAt(i);

      // If we are at a EOF or EOR
      if (inQuote === false && (cur === delimiter || cur === "\n")) {
	field = processField(field);
        // Add the current field to the current row
        row.push(field);
        // If this is EOR append row to output and flush row
        if (cur === "\n") {
          out.push(row);
          row = [];
        }
        // Flush the field buffer
        field = '';
        fieldQuoted = false;
      } else {
        // If it's not a quotechar, add it to the field buffer
        if (cur !== quotechar) {
          field += cur;
        } else {
          if (!inQuote) {
            // We are not in a quote, start a quote
            inQuote = true;
            fieldQuoted = true;
          } else {
            // Next char is quotechar, this is an escaped quotechar
            if (s.charAt(i + 1) === quotechar) {
              field += quotechar;
              // Skip the next char
              i += 1;
            } else {
              // It's not escaping, so end quote
              inQuote = false;
            }
          }
        }
      }
    }

    // Add the last field
    field = processField(field);
    row.push(field);
    out.push(row);

    return out;
  };
