var rawData;
var clusterfck;

var dataFile;
var annotationFile;

var desiredDistanceFunction;
var desiredLinkageFunction;

var desiredNormalizationCenter;
var desiredNormalizationDivide;

function sketch( pjs ){

	pjs.setup = function(){
		
		pjs.size( 0, 0 );
		pjs.background( 255, 255, 255 );
		pjs.noLoop();
		
		rawData = new DataSet( pjs );

	};
	
	pjs.mouseMoved = function(){
	
		if( pjs.mouseX > rawData.startX && pjs.mouseX < rawData.startX + rawData.numColumns * rawData.cellWidth ){
			if( pjs.mouseY > rawData.startY && pjs.mouseY < rawData.startY + rawData.numRows * rawData.cellHeight ){
				row = Math.floor( ( pjs.mouseY - rawData.startY ) / rawData.cellHeight );
				column = Math.floor( ( pjs.mouseX - rawData.startX ) / rawData.cellWidth );
				if( (rawData.mouseRow != row || rawData.mouseColumn != column) && !rawData.holdMouse ){
					rawData.mouseRow = row;
					rawData.mouseColumn = column;
					rawData.drawHeatMap();
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

function parseInputData( input, rowDelimeter, columnDelimeter ){

	if( !input ){ return ""; }
	
	var tmp = input.split( rowDelimeter );
	var output = [];
	var index = 0;
	
	for( var i = 0; i < tmp.length; i++ ){
	
		if( tmp[i] !== "" ){
			output[index] = tmp[i].split( columnDelimeter );
			index++;
		}
	
	}
	
	return output;

}

function DataSet( pjs ){

	this.pjs = pjs;
	
	this.numRows = 0;
	this.numColumns = 0;

	this.columnNames = [];
	this.data = [];
	this.normalizedData = [];
	this.annotations = [];
	this.displayOrder = [];
	
	this.labelRows = true;
	this.labelColumns = true;
	this.labelOption = 0;
	
	this.minColor = this.pjs.color( 0, 0, 0 );
	this.midColor = this.pjs.color( 0, 0, 0 );
	this.maxColor = this.pjs.color( 0, 0, 0 );

	this.minRange = -1.0;
	this.midRange = 0.0;
	this.maxRange = 1.0;
	
	this.startX = 0;
	this.startY = 0;
	this.cellWidth = 15;
	this.cellHeight = 10;
	
	this.labelBufferX = 0;
	this.labelBufferY = 0;
	
	this.mouseRow = 0;
	this.mouseColumn = 0;
	this.holdMouse = false;

}

DataSet.prototype.initialize = function( values, firstDataRow, firstDataColumn, annotFile ){

	if( !values ){ return; }

	if(  firstDataRow >= 1 && firstDataColumn >= 1 ){
		for( k = firstDataColumn; k < values[0].length; k++ ){
			this.columnNames[ k - firstDataColumn ] = values[0][k].toString();
		}
		for( k = 0; k < values.length; k++ ){
			this.annotations[k] = [];
			for( var l = 0; l < firstDataColumn; l++ ){
				this.annotations[k][l] = values[k][l].toString();
			}
			if( annotFile ){
				for( var m = 0; m < annotFile.length; m++ ){
					var currID = annotFile[m][0];
					if( currID == ( '"' + this.annotations[k][0] + '"' ) ){
						for( var n = 1; n < annotFile[m].length; n++ ){
							this.annotations[k].push( annotFile[m][n] );
						}
						break;
					}
				}
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

	this.numRows = this.data.length;
	this.numColumns = this.data[0].length;

	this.resetNormalizedData();

}
DataSet.prototype.autoSetRangeValues = function( mult ){
	var min = this.normalizedData[0][0];
	var max = this.normalizedData[0][0];
	var mid = 0.0;
	for( var p = 0; p < this.numRows; p++ ){
		for( var q = 0; q < this.numColumns; q++ ){
			min = this.normalizedData[p][q] < min ? this.normalizedData[p][q] : min;
			max = this.normalizedData[p][q] > max ? this.normalizedData[p][q] : max;
			mid += this.normalizedData[p][q];
		}
	}
	mid = mid / ( p * q );
	this.setValueRange( ( mid + ( min - mid ) * mult ), mid, ( mid + ( max - mid ) * mult ) );
}
DataSet.prototype.labelAxes = function(){
	this.pjs.fill( 0, 0, 0 );
	var font = this.pjs.createFont( "Arial", this.data.cellHeight, true );
	var numRows = this.data.length;
	var numColumns = this.data[0].length;
		
	if( this.labelRows ){
		this.pjs.textFont( font, this.cellHeight );		
		for( i = 0; i < numRows; i++ ){
			this.pjs.text( this.annotations[ this.displayOrder[i] + 1 ][this.labelOption], this.startX + numColumns * this.cellWidth + 1, this.startY + ( i + 1 ) * this.cellHeight );
		}
	}
	
	if( this.labelColumns ){
		this.pjs.textFont( font, this.cellWidth );
		for( var j = 0; j < numColumns; j++ ){
			this.pjs.pushMatrix();
			this.pjs.translate( ( j + 1 ) * this.cellWidth + this.startX, this.startY );
			this.pjs.rotate( this.pjs.radians(270) );
			this.pjs.text( this.columnNames[j], 0, 0 );
			this.pjs.popMatrix();
		}
	}
}
DataSet.prototype.setColorRange = function( minColorIn, midColorIn, maxColorIn ){
	this.minColor = minColorIn; this.midColor = midColorIn; this.maxColor = maxColorIn; 
}
DataSet.prototype.setValueRange = function( minRangeIn, midRangeIn, maxRangeIn ){
	this.minRange = minRangeIn; this.midRange = midRangeIn; this.maxRange = maxRangeIn; 
}
DataSet.prototype.getValueRange = function(){
	return [ this.minRange, this.midRange, this.maxRange ];
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
	this.cellWidth = cellWidthIn; this.cellHeight = cellHeightIn; 
}
DataSet.prototype.setLabelBuffers = function(){

	var numRows = this.data.length;
	var numColumns = this.data[0].length;
	var font = this.pjs.createFont( "Arial", this.data.cellHeight, true );	
	this.pjs.textFont( font, this.cellHeight );		

	var maxTextWidth = 0;
	for( var i = 0; i < numRows; i++ ){
		if( maxTextWidth < this.pjs.textWidth( this.annotations[i + 1][this.labelOption] ) ){
			maxTextWidth = this.pjs.textWidth( this.annotations[i + 1][this.labelOption] );
		}
	}
	this.labelBufferX = maxTextWidth + 2;
	
	this.pjs.textFont( font, this.cellWidth );
	
	maxTextWidth = 0;
	for( i = 0; i < numColumns; i++ ){
		if( maxTextWidth < this.pjs.textWidth( this.columnNames[i] ) ){
			maxTextWidth = this.pjs.textWidth( this.columnNames[i] );
		}
	}
	this.labelBufferY = maxTextWidth + 2;
	
	if( !this.labelRows ){ this.labelBufferX = 0; }
	if( !this.labelColumns ){ this.labelBufferY = 0; }
	
	if( this.labelBufferX > 100 ){ this.labelBufferX = 100; }
	if( this.labelBufferY > 100 ){ this.labelBufferY = 100; }
	
	this.startY = this.labelBufferY;
	
	this.pjs.size( numColumns * this.cellWidth + this.labelBufferX, numRows* this.cellHeight + this.labelBufferY );

}
DataSet.prototype.resetNormalizedData = function(){

	this.normalizedData = [];

	for( var i = 0; i < this.data.length; i++ ){
		this.normalizedData[i] = this.data[i].slice(0);

	}

}
DataSet.prototype.divideRowsByStdDev = function(){

	for( var i = 0; i < this.numRows; i++ ){
	
		var currStdDev = this.normalizedData[i].stdDev();
		for( var j = 0; j < this.numColumns; j++ ){
		
			this.normalizedData[i][j] = this.normalizedData[i][j] / currStdDev;
		
		}
	
	}

}
DataSet.prototype.meanCenterRows = function(){

	for( var i = 0; i < this.numRows; i++ ){
	
		var currMean = this.normalizedData[i].mean();
		for( var j = 0; j < this.numColumns; j++ ){
		
			this.normalizedData[i][j] = this.normalizedData[i][j] - currMean;
		
		}
	
	}

}
DataSet.prototype.medianCenterRows = function(){

	for( var i = 0; i < this.numRows; i++ ){
	
		var currMedian = this.normalizedData[i].slice(0).median();
		for( var j = 0; j < this.numColumns; j++ ){
		
			this.normalizedData[i][j] = this.normalizedData[i][j] - currMedian;
		
		}
	
	}

}
DataSet.prototype.drawHeatMap = function(){

	this.pjs.noStroke();
	if( this.data.length === 0 ){ return; }
	if( this.data[0].length === 0 ){ return; }
	
	var numRows = this.data.length;
	var numColumns = this.data[0].length;
	
	this.setLabelBuffers();
	
	for( var r = 0; r < numRows; r++ ){
		for( var s = 0; s < numColumns; s++ ){
			this.pjs.fill( this.getCellColor( this.normalizedData[this.displayOrder[r]][s] ) );
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
	this.labelAxes();

}
DataSet.prototype.writeAnnotations = function(){
	document.getElementById('annotationBox').innerHTML = '<b>Row:</b> ' + this.mouseRow + '</br>';
	document.getElementById('annotationBox').innerHTML += '<b>Column:</b> ' + this.mouseColumn + '</br>';
	document.getElementById('annotationBox').innerHTML += '<b>Raw Value:</b> ' + this.data[this.displayOrder[this.mouseRow]][this.mouseColumn] + '</br>';
	document.getElementById('annotationBox').innerHTML += '<b>Normalized Value:</b> ' + this.normalizedData[this.displayOrder[this.mouseRow]][this.mouseColumn] + '</br>';
	document.getElementById('annotationBox').innerHTML += '<b>Sample Name:</b> ' + this.columnNames[this.mouseColumn] + '</br>';
	for( var i = 0; i < this.annotations[this.displayOrder[this.mouseRow] + 1].length; i++ ){
		document.getElementById('annotationBox').innerHTML += ( this.annotations[0].length >= i ? ( '<b>' + this.annotations[0][i] + ':</b> ') : '') + this.annotations[this.displayOrder[this.mouseRow] + 1][i] + '</br>';
	}
}
DataSet.prototype.getMouseRow = function(){
	return this.mouseRow;
}
DataSet.prototype.getMouseColumn = function(){
	return this.mouseColumn;
}
DataSet.prototype.setMouseRow = function( value ){
	this.mouseRow = value;
}
DataSet.prototype.setMouseColumn = function( value ){
	this.mouseColumn = value;
}
DataSet.prototype.setLabelOption = function( value ){
	this.labelOption = value;
}
DataSet.prototype.getRowLabelsHTML = function(){

	var output = "";
	if( !this.annotations[0] ){ return output; }
	
	for( var i = 0; i < this.annotations[0].length; i++ ){
		output += '<option value="' + i.toString() + '">' + this.annotations[0][i] + '</option></br>';
	}
	return output;

}
DataSet.prototype.setLabelingEnabled = function( rows, columns ){
	this.labelRows = rows;
	this.labelColumns = columns;
}
DataSet.prototype.cluster = function(){

	var input = [];
	for( var i = 0; i < this.data.length; i++ ){
		input[i] = [];
		input[i][0] = i;
		for( var j = 1; j <= this.data[0].length; j++ ){
			input[i][j] = this.normalizedData[i][j-1];
		}
	}
	var clusters = clusterfck.hcluster( input, desiredDistanceFunction, desiredLinkageFunction )[0];
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

function filterInt( value ){

	var val = parseInt( value );
	return isNaN( val ) ? 0 : val;

}

function init( clusterfckHandle ){

	var processingInstance = new Processing( document.getElementById('canvas'), sketch );
	clusterfckLocal = clusterfckHandle;
	
	document.getElementById('dataFileInput').addEventListener( 'change', handleDataFileSelect, false );
	document.getElementById('annotationFileInput').addEventListener( 'change', handleAnnotationFileSelect, false );

	document.getElementById('autoSetValueRangeButton').onclick = autoAdjustRange;
	
	var guiElements = document.getElementsByClassName('gui');
	for( var i = 0; i < guiElements.length; i++ ){
		guiElements[i].onchange = updateGuiInput;
	}
	
	document.getElementById('normalizeInput').onclick = function(){ 
		if( document.getElementById('normalizationCenterInput').value == "mean" ){
			rawData.meanCenterRows();
		}
		if( document.getElementById('normalizationCenterInput').value == "median" ){
			rawData.medianCenterRows();
		}
		
		if( document.getElementById('normalizationDivideInput').value == "stdDev" ){
			rawData.divideRowsByStdDev();
		}
		if( document.getElementById('normalizationDivideInput').value == "rms" ){
			//rawData.divideRowsByRMS();
		}
	console.log(document.getElementById('normalizationCenterInput').value);
	console.log(document.getElementById('normalizationDivideInput').value);
		drawMap();
	 
	};
	document.getElementById('unNormalizeInput').onclick = function(){
	
		rawData.resetNormalizedData();
		drawMap();
	
	};
	
	document.getElementById('enableClusterButton').onclick = function(){ 
		rawData.cluster();
		drawMap();
	};
	document.getElementById('disableClusterButton').onclick = function(){ 
		rawData.unCluster();
		drawMap();
	};
		
	updateGuiInput();
		
}

function drawMap(){

	rawData.drawHeatMap();

}
function autoAdjustRange(){

	rawData.autoSetRangeValues( 0.8 );
	document.getElementById('valueRangeMinInput').value = rawData.getValueRange()[0];
	document.getElementById('valueRangeMidInput').value = rawData.getValueRange()[1];
	document.getElementById('valueRangeMaxInput').value = rawData.getValueRange()[2];
	updateGuiInput();

}
function changeRowLabelOptions(){

	rowLabelSelect.innerHTML = rawData.getRowLabelsHTML();

}
function loadFiles(){

	updateGuiInput();
		
	var drd = document.getElementById('dataRowDelimiterInput').value.replace( /\\n/g, "\n" ).replace( /\\t/g, "\t" );
	var dcd = document.getElementById('dataColumnDelimiterInput').value.replace( /\\n/g, "\n" ).replace( /\\t/g, "\t" );
	var ard = document.getElementById('annotationRowDelimiterInput').value.replace( /\\n/g, "\n" ).replace( /\\t/g, "\t" );
	var acd = document.getElementById('annotationColumnDelimiterInput').value.replace( /\\n/g, "\n" ).replace( /\\t/g, "\t" );

	var firstRow = isNaN( parseInt( document.getElementById('dataFirstRowInput').value ) ) ? 0 : parseInt( document.getElementById('dataFirstRowInput').value ) - 1 ;
	var firstColumn = isNaN( parseInt( document.getElementById('dataFirstColumnInput').value ) ) ? 0 : parseInt( document.getElementById('dataFirstColumnInput').value ) - 1 ;

	rawData.initialize( parseInputData( dataFile, drd, dcd ), firstRow, firstColumn, parseInputData( annotationFile, ard, acd ) );
	autoAdjustRange();
	console.log( rawData );
	changeRowLabelOptions();
	drawMap();

}
function handleDataFileSelect( evt ){
	var reader = new FileReader();
	reader.readAsText( evt.target.files[0] );
	reader.onload = function(){
		dataFile = reader.result;
		//loadFiles();
	};
}
function handleAnnotationFileSelect( evt ){
	var reader = new FileReader();
	reader.readAsText( evt.target.files[0] );
	reader.onload = function(){
		annotationFile = reader.result;
		//loadFiles();
	};
}
function downloadImg(){
	var tmpr = rawData.getMouseRow();
	var tmpc = rawData.getMouseColumn();
	rawData.setMouseRow( -1 );
	rawData.setMouseColumn( -1 );
	rawData.drawHeatMap();
	rawData.labelAxes();
	rawData.setMouseRow( tmpr );
	rawData.setMouseColumn( tmpc );
	
	window.open( canvas.toDataURL(), '_blank' );
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

	desiredNormalizaionCenter = document.getElementById('normalizationCenterInput').value;
	desiredNormalizaionDivide = document.getElementById('normalizationDivideInput').value;

	var minColor = rawData.pjs.color( parseInt( document.getElementById('colorLowR').value ), parseInt( document.getElementById('colorLowG').value ), parseInt( document.getElementById('colorLowB').value ) );
	var midColor = rawData.pjs.color( parseInt( document.getElementById('colorMidR').value ), parseInt( document.getElementById('colorMidG').value ), parseInt( document.getElementById('colorMidB').value ) );
	var maxColor = rawData.pjs.color( parseInt( document.getElementById('colorHighR').value ), parseInt( document.getElementById('colorHighG').value ), parseInt( document.getElementById('colorHighB').value ) );

	rawData.setColorRange( minColor, midColor, maxColor );
	rawData.setCellSize( parseInt( document.getElementById('cellWidthInput').value ), parseInt( document.getElementById('cellHeightInput').value ) );
	rawData.setValueRange( parseFloat( document.getElementById('valueRangeMinInput').value ), parseFloat( document.getElementById('valueRangeMidInput').value ), parseFloat( document.getElementById('valueRangeMaxInput').value ) );
	rawData.setLabelingEnabled( document.getElementById('labelRowsInput').checked, document.getElementById('labelColumnsInput').checked );
	
	rawData.setLabelOption( isNaN( parseInt( document.getElementById('rowLabelSelect').value ) ) ? 0 : parseInt( document.getElementById('rowLabelSelect').value ) );

	drawMap();
	
}