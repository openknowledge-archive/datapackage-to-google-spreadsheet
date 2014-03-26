datapackage-to-google-spreadsheet
=================================

Import tabular data packages (http://data.okfn.org/doc/data-package) into Google Spreadsheets

## Demo
To import a tabular data pacakage into Google Spreadsheets:

  1. Go to https://docs.google.com/spreadsheet/ccc?key=0AqR8dXc6Ji4JdG15Z1BhNXpCMFBnVTY5LUpoTGNrY0E#gid=0
  2. Make a copy of the sheet
  3. Go to Data Packages Menu -> Import Data. On the first run, you will be asked for authorization.
  4. Paste in the url: http://data.okfn.org/data/house-prices-us/datapackage.json
  5. Watch the data load!

Note: You can replace the datapackage.json url with any other tabular data package link

## How it works
A small script is included in the spreadsheet. This in turn uses a library (the code from this repository) that loads and processes CSV data from the data package.

## Do it yourself
To use the script in your own spreadsheets:
  1. In your spreadsheet open the script editor to create a new script
  2. Include the library. To do this:
    
    * Go to Resources => Manage Resources
    * Use the project id: MH6zwb-_fUDq8QyPrl-PbJlu_4T1jeIs_
    * Make sure that the latest version is selected
    * More information on using libraries can be found here: https://developers.google.com/apps-script/guide_libraries#useLibrary

  3. Copy and paste the following into your script and hit save:

        function onOpen() {
          DataPackages.onOpen();
        }
    
        function importDataPackageUi() {
          DataPackages.importDataPackageUi();
        }

  4. Hit run.
  5. There is now a new Data Packages menu in your spreadsheet. Whenever you open the spreadsheet in the future it will be there.

## Data Requirements
Currently, the library can cope with a single CSV file from a tabular data package. The field separator should be a comma, the text delimiter should be " and the line separator should be \n. That means we're not yet fully conformant with the specification, but this will hopefully be achieved soon via a more general API that pre-processes the data according to format and dialect. 

