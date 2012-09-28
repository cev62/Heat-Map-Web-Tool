var inputText;
var rawData;
var clusterfck;

var dataFile;
var annotationFile;

var canvas;
var annotationBox;

var distanceSelectInput;
var linkageSelectInput;
var showClusteredDataButton;
var showOriginalDataButton;

var dataFileUploadInput;
var annotationFileUploadInput;
var loadFileButton;
var downloadButton;

var minColorInputR;
var minColorInputG;
var minColorInputB;
var midColorInputR;
var midColorInputG;
var midColorInputB;
var maxColorInputR;
var maxColorInputG;
var maxColorInputB;

var minValueInput;
var midValueInput;
var maxValueInput;
var autoSetValueRangeButton;

var desiredDistanceFunction;
var desiredLinkageFunction;

function sketch( pjs ){

	pjs.setup = function(){
		
		pjs.size( 0, 0 );
		pjs.background( 255, 255, 255 );
		pjs.noLoop();
		inputText = pjs.loadStrings("HeatMap_Example.txt");
		rawData = new DataSet( pjs );
		rawData.initialize( parseInputData( inputText, '\t' ), 1, 2 );
		rawData.autoSetRangeValues( 0.8 );
		rawData.setStartCoord( 0, 50 );
		//rawData.cluster();
		console.log( rawData );
		pjs.drawMap();

	};
	
	pjs.drawMap = function(){

		pjs.background( 255, 255, 255 );
		rawData.drawHeatMap();
		rawData.labelAxes();
		
	};
	
	pjs.draw = function(){
	
	
	
	};
	
	pjs.mouseMoved = function(){
	
		if( pjs.mouseX > rawData.startX && pjs.mouseX < rawData.startX + rawData.data[0].length * rawData.cellWidth ){
			if( pjs.mouseY > rawData.startY && pjs.mouseY < rawData.startY + rawData.data.length * rawData.cellHeight ){
				row = Math.floor( ( pjs.mouseY - rawData.startY ) / rawData.cellHeight );
				column = Math.floor( ( pjs.mouseX - rawData.startX ) / rawData.cellWidth );
				if( (rawData.mouseRow != row || rawData.mouseColumn != column) && !rawData.holdMouse ){
					rawData.mouseRow = row;
					rawData.mouseColumn = column;
					pjs.drawMap();
				}
			}
		}
		
	
	};
	
	pjs.mousePressed = function(){
		if( pjs.mouseX > rawData.startX && pjs.mouseX < rawData.startX + rawData.data[0].length * rawData.cellWidth ){
			if( pjs.mouseY > rawData.startY && pjs.mouseY < rawData.startY + rawData.data.length * rawData.cellHeight ){
				rawData.holdMouse = !rawData.holdMouse;
			}
		}
	};

}

function parseInputData( input, delimiter ){

	var output = [];

	for( var i = 0; i < input.length; i++ ){
		
		output[i] = [];
	
		var value = "";
		var cellIndex = 0;
	
		for( var j = 0; j < input[i].length; j++ ){
		
			if( input[i].charAt(j) == delimiter ){
				output[i][cellIndex] = value;
				value = "";
				cellIndex++;
			}
			else{
				value += input[i].charAt(j);
			}
		
		}
		
		output[i][cellIndex] = value;
	
	}
	
	return output;

}

function DataSet( pjs ){

	this.pjs = pjs;

	this.columnNames = [];
	this.data = [];
	this.annotations = [];
	this.displayOrder = [];
	
	this.minColor = this.pjs.color( 255, 0, 0 );
	this.midColor = this.pjs.color( 0,0,0 );
	this.maxColor = this.pjs.color( 0,255,0 );

	this.minRange = 0.0;
	this.midRange = 5.0;
	this.maxRange = 10.0;
	
	this.startX = 0;
	this.startY = 0;
	this.cellWidth = 15;
	this.cellHeight = 10;
	
	this.mouseRow = 0;
	this.mouseColumn = 0;
	this.holdMouse = false;

}

DataSet.prototype.initialize = function( values, firstDataRow, firstDataColumn ){

	if(  firstDataRow >= 1 && firstDataColumn >= 1 ){
		for( k = firstDataColumn; k < values[0].length; k++ ){
			this.columnNames[ k - firstDataColumn ] = values[0][k].toString();
		}
		for( k = 0; k < values.length; k++ ){
			this.annotations[k] = [];
			for( var l = 0; l < firstDataColumn; l++ ){
				this.annotations[k][l] = values[k][l].toString();
			}
		}
	}
	for( k = firstDataRow; k < values.length; k++ ){
		this.data[ k - firstDataRow ] = [];
		for( var l = firstDataColumn; l < values[0].length; l++ ){
			this.data[ k - firstDataRow ][ l - firstDataColumn ] = parseFloat(values[k][l]);
			this.displayOrder[ k - firstDataRow ] = k - firstDataRow;
		}
	}

}
DataSet.prototype.autoSetRangeValues = function( mult ){
	var min = this.data[0][0];
	var max = this.data[0][0];
	for( var p = 0; p < this.data.length; p++ ){
		for( var q = 0; q < this.data[0].length; q++ ){
			min = this.data[p][q] < min ? this.data[p][q] : min;
			max = this.data[p][q] > max ? this.data[p][q] : max;
		}
	}
	var mid = ( min + max ) / 2;
	this.setValueRange( ( mid + ( min - mid ) * mult ), mid, ( mid + ( max - mid ) * mult ) );
}
DataSet.prototype.labelAxes = function(){
	this.pjs.fill( 0, 0, 0 );
	var font = this.pjs.createFont( "Arial", this.data.cellHeight, true );
	this.pjs.textFont( font, this.cellHeight );		
	var numRows = this.data.length;
	var numColumns = this.data[0].length;
	for( var i = 0; i < numRows; i++ ){
		this.pjs.text( this.annotations[ this.displayOrder[i] + 1 ][0], this.startX + numColumns * this.cellWidth + 1, this.startY + ( i + 1 ) * this.cellHeight );
	}
	this.pjs.textFont( font, this.cellWidth );
	for( var j = 0; j < numColumns; j++ ){
		this.pjs.pushMatrix();
		this.pjs.translate( ( j + 1 ) * this.cellWidth + this.startX, this.startY );
		this.pjs.rotate( this.pjs.radians(270) );
		this.pjs.text( this.columnNames[j], 0, 0 );
		this.pjs.popMatrix();
	}
}
DataSet.prototype.setColorRange = function( minColorIn, midColorIn, maxColorIn ){
	this.minColor = minColorIn; this.midColor = midColorIn; this.maxColor = maxColorIn; 
}
DataSet.prototype.setValueRange = function( minRangeIn, midRangeIn, maxRangeIn ){
	this.minRange = minRangeIn; this.midRange = midRangeIn; this.maxRange = maxRangeIn; 
}
DataSet.prototype.getCellColor = function( value ){
	if( value > this.midRange ){
     	if( value >= this.maxRange ){ return this.maxColor; }
     	return this.pjs.lerpColor( this.midColor, this.maxColor, this.pjs.norm( value, this.midRange, this.maxRange ) );
    }
   	else{
		if( value <= this.minRange ){ return this.minColor; }
    	return this.pjs.lerpColor( this.minColor, this.midColor, this.pjs.norm( value, this.minRange, this.midRange ) ); 
    }
}
DataSet.prototype.setStartCoord = function( startXIn, startYIn ){
	this.startX = startXIn; this.startY = startYIn; 
}
DataSet.prototype.setCellSize = function( cellWidthIn, cellHeightIn ){
	this.cellWidth = cellHeightIn; this.cellHeight = cellHeightIn; 
}
DataSet.prototype.drawHeatMap = function(){

	this.pjs.noStroke();
	if( this.data.length === 0 ){ return; }
	if( this.data[0].length === 0 ){ return; }
	
	var numRows = this.data.length;
	var numColumns = this.data[0].length;
	
	this.pjs.size( numColumns * this.cellWidth + 100, numRows* this.cellHeight + 50 );
	
	for( var r = 0; r < numRows; r++ ){
		for( var s = 0; s < numColumns; s++ ){
			this.pjs.fill( this.getCellColor( this.data[this.displayOrder[r]][s] ) );
			this.pjs.rect( this.startX + s * this.cellWidth, this.startY + r * this.cellHeight, this.cellWidth, this.cellHeight );
		}
	}
	if( this.mouseRow >= 0 && this.mouseRow < numRows && this.mouseColumn >= 0 && this.mouseColumn < numColumns ){
		this.pjs.noFill();
		this.pjs.stroke(255);
		this.pjs.rect( this.startX + this.mouseColumn * this.cellWidth, this.startY + this.mouseRow * this.cellHeight, this.cellWidth, this.cellHeight );
		this.pjs.noStroke();
		this.writeAnnotations();
	}
}
DataSet.prototype.writeAnnotations = function(){
	//console.log("c: " + this.mouseColumn);
	annotationBox.innerHTML = 'Row: ' + this.mouseRow + '</br>';
	annotationBox.innerHTML += 'Column: ' + this.mouseColumn + '</br>';
	annotationBox.innerHTML += 'Value: ' + this.data[this.displayOrder[this.mouseRow]][this.mouseColumn] + '</br>';
	annotationBox.innerHTML += 'Sample Name: ' + this.columnNames[this.mouseColumn] + '</br>';
	for( var i = 0; i < this.annotations[0].length; i++ ){
		annotationBox.innerHTML += this.annotations[0][i] + ': ' + this.annotations[this.displayOrder[this.mouseRow] + 1][i] + '</br>';
	}

}
DataSet.prototype.draw = function(){

	this.drawHeatMap();
	this.writeAnnotations();
	this.labelAxes();

}

DataSet.prototype.cluster = function(){

	var input = [];
	for( var i = 0; i < this.data.length; i++ ){
		input[i] = [];
		input[i][0] = i;
		for( var j = 1; j <= this.data[0].length; j++ ){
			input[i][j] = this.data[i][j-1];
		}
	}
	var clusters = clusterfck.hcluster( input, desiredDistanceFunction, desiredLinkageFunction )[0];
	console.log(clusters);
	var newData = [];
	doClusters( clusters, newData );
	for( var i = 0; i < this.displayOrder.length; i++ ){
		this.displayOrder[i] = newData[i][0];
	}
	
}

DataSet.prototype.unCluster = function(){
	for( var i = 0; i < this.displayOrder.length; i++ ){
		this.displayOrder[i] = i;
	}
}

function doClusters( cluster, output ){
	if( cluster.hasOwnProperty('left') ){
		doClusters( cluster['left'], output );
	}
	if( cluster.hasOwnProperty('right') ){
		doClusters( cluster['right'], output );
	}
	else{
		output[ output.length ] = cluster['canonical'];
	}
}

function init( clusterfckHandle ){
	canvas = document.getElementById('canvas');	
	annotationBox = document.getElementById('annotations');

 	showClusteredDataButton = document.getElementById('enableClusterButton');
	showOriginalDataButton = document.getElementById('disableClusterButton');
	
	dataFileUploadInput = document.getElementById('dataFileInput');
	dataFileUploadInput.addEventListener( 'change', handleDataFileSelect, false );
	annotationFileUploadInput = document.getElementById('annotationFileInput');
	annotationFileUploadInput.addEventListener( 'change', handleAnnotationFileSelect, false );
	loadFileButton = document.getElementById('loadFilesButton');
	loadFileButton.onclick = loadFiles;
	downloadButton = document.getElementById('downloadButton');

	minColorInputR = document.getElementById('colorLowR');
	minColorInputR.value = '0';
	minColorInputG = document.getElementById('colorLowG');
	minColorInputG.value = '255';
	minColorInputB = document.getElementById('colorLowB');
	minColorInputB.value = '0';
	midColorInputR = document.getElementById('colorMidR');
	midColorInputR.value = '0';
	midColorInputG = document.getElementById('colorMidG');
	midColorInputG.value = '0';
	midColorInputB = document.getElementById('colorMidB');
	midColorInputB.value = '0';
	maxColorInputR = document.getElementById('colorHighR');
	maxColorInputR.value = '255';
	maxColorInputG = document.getElementById('colorHighG');
	maxColorInputG.value = '0';
	maxColorInputB = document.getElementById('colorHighB');
	maxColorInputB.value = '0';

	minValueInput = document.getElementById('valueRangeMinInput');
	midValueInput = document.getElementById('valueRangeMidInput');
	maxValueInput = document.getElementById('valueRangeMaxInput');
	autoSetValueRangeButton = document.getElementById('autoSetValueRangeButton');

	distanceSelect = document.getElementById('distanceSelect');
	linkageSelect = document.getElementById('linkageSelect');
	
	var guiElements = document.getElementsByClassName('gui');
	for( var i = 0; i < guiElements.length; i++ ){
		guiElements[i].onchange = updateGuiInput;
	}
	
	
	var processingInstance = new Processing( canvas, sketch );
	clusterfckLocal = clusterfckHandle;
	
	document.getElementById('enableClusterButton').onclick = function(){ 
		rawData.cluster();
		rawData.drawHeatMap();
		rawData.labelAxes(); 
	};
	document.getElementById('disableClusterButton').onclick = function(){ 
		rawData.unCluster();
		rawData.drawHeatMap();
		rawData.labelAxes(); 
	};
		
	distanceSelect.onchange = updateGuiInput;
	linkageSelect.onchange = updateGuiInput;
	updateGuiInput();
	
	rawData.draw();
	
}

function loadFiles(){

	console.log(dataFile);

	

}

function handleDataFileSelect( evt ){
	var reader = new FileReader();
	reader.readAsText( evt.target.files[0] );
	reader.onload = function(){
		dataFile = reader.result;
	};
}

function handleAnnotationFileSelect( evt ){
	var reader = new FileReader();
	reader.readAsText( evt.target.files[0] );
	reader.onload = function(){
		annotationFile = reader.result;
	};
}

function downloadImg(){
	var tmpr = rawData.mouseRow;
	var tmpc = rawData.mouseColumn;
	rawData.mouseRow = -1;
	rawData.mouseColumn = -1;
	rawData.drawHeatMap();
	rawData.labelAxes();
	rawData.mouseRow = tmpr;
	rawData.mouseColumn = tmpc;
	
	//window.open( rawData.pjs.save("test.png") );
	//window.location.href = canvas.toDataURL();
	window.open( canvas.toDataURL(), '_blank' );
}

var euclideanDistWithId = function( input1, input2 ){
	var output = 0.0;
	for( var i = 1; i < input1.length; i++ ){
		output += Math.pow( input2[i] - input1[i], 2 );
	}
	return Math.sqrt( output );
};

var manhattanDistWithId = function( input1, input2 ){
	var output = 0.0;
	for( var i = 1; i < input1.length; i++ ){
		output += Math.abs( input2[i] - input1[i] );
	}
	return output ;
};

var maximumDistWithId = function( input1, input2 ){
	var output = 0.0;
	for( var i = 1; i < input1.length; i++ ){
		output = Math.max( output, Math.abs( input2[i] - input1[i] ) );
	}
	return output;
};

var pearsonDistWithId = function ( input1In, input2In ){

	var input1 = input1In.slice(1);
	var input2 = input2In.slice(1);
	var n = input1.length;
	
	var numerator = multiplyAndSumArrays(input1,input2) - sumArray(input1)*sumArray(input2)/n;
	var denominator = Math.sqrt( ( sumArraySquared(input1) - sumArray(input1)*sumArray(input1)/n ) * ( sumArraySquared(input2)-sumArray(input2)*sumArray(input2)/n ) );

	output = numerator / denominator;
	return 1 / output;
}

function sumArray( input ){
	var total = 0.0;
	for( var i = 0; i < input.length; i++ ){
		total += input[i];
	}
	return total;
}

function sumArraySquared( input ){
	/*var total = 0.0;
	for( var i = 0; i < input.length; i++ ){
		total += input[i] * input[i];
	}
	return total;*/
	return multiplyAndSumArrays( input, input );
}

function multiplyAndSumArrays( input1, input2 ){
	var total = 0.0;
	for( var i = 0; i < input1.length; i++ ){
		total += input1[i] * input2[i];
	}
	return total;
}

function updateGuiInput(){

	desiredDistanceFunction = document.getElementById('distanceSelect').value == "maximum" ? maximumDistWithId : 
								( document.getElementById('distanceSelect').value == "manhattan" ? manhattanDistWithId : 
								( document.getElementById('distanceSelect').value == "pearson" ? pearsonDistWithId : euclideanDistWithId ) );
	
	desiredLinkageFunction = document.getElementById('linkageSelect').value == "single" ? clusterfck.SINGLE_LINKAGE : 
								( document.getElementById('linkageSelect').value == "complete" ? clusterfck.COMPLETE_LINKAGE : clusterfck.AVERAGE_LINKAGE );

	rawData.minColor = rawData.pjs.color( parseInt( document.getElementById('colorLowR').value ), parseInt( document.getElementById('colorLowG').value ), parseInt( document.getElementById('colorLowB').value ) );
	rawData.midColor = rawData.pjs.color( parseInt( document.getElementById('colorMidR').value ), parseInt( document.getElementById('colorMidG').value ), parseInt( document.getElementById('colorMidB').value ) );
	rawData.maxColor = rawData.pjs.color( parseInt( document.getElementById('colorHighR').value ), parseInt( document.getElementById('colorHighG').value ), parseInt( document.getElementById('colorHighB').value ) );

}

