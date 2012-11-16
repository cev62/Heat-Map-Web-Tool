Heat-Map-Web-Tool
=================

This tool will not work in Internet Explorer, because it uses the HTML5 File API.

=================

Uploaded file requirements:

Data and Annotation files must be .txt or .csv files, and follow standard csv conventions.
Specific delimiters can be changed within the tool's user interface.

The Data file is required, and it may include annotations.  
 -There is support for up to one row of annotations in the first row of the file.
 -There is support for an unlimited number of columns of annotations in the leftmost columns of the file.
 -The first row that contains data (not annotations) and the first column that contains data (not annotations) must be specified in the tool's user interface.

The separate Annotation file is optional.  If it is included: 
 -The first column of both files should contain a unique identifier for that row.  
 -This identifiers should match the identifier for the corresponding row in the other file.

==================

Sample Data:

Example data is located in the "/Sample Data" directory.
The data file is called "Data_File_Example.txt".
The annotation file is called "Annotation_File_Example.txt".