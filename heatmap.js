var inputText;
var rawData;
var cData;

var annotationBox;
var canvas;

var clusterfck;

function sketch( pjs ){

	pjs.setup = function(){
		
		pjs.size( 0, 0 );
		//pjs.background( 255, 255, 255 );
		pjs.noLoop();
		inputText = pjs.loadStrings("HeatMap_Example.txt");
		rawData = new DataSet( pjs );
		rawData.initialize( parseInputData( inputText, '\t' ), 1, 2 );
		rawData.autoSetRangeValues( 0.8 );
		rawData.setStartCoord( 0, 50 );
		cData = rawData;
		cData.data = cluster( cData.data );
		console.log( rawData );
		console.log( cData );
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
	this.rowNames = [];
	this.data = [];
	this.annotations = [];
	
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

DataSet.prototype.getValue = function( row, column ){ return this.data[row][column]; }
DataSet.prototype.getData = function(){ return this.data; }
DataSet.prototype.getAnnotationValue = function( row, column ){ return this.annotations[row][column]; }
DataSet.prototype.getRowName = function( row ){ return this.rowNames[row]; }
DataSet.prototype.getColumnName = function( column ){ return this.columnNames[column]; }
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
		this.pjs.text( this.annotations[ i + 1 ][0], this.startX + numColumns * this.cellWidth + 1, this.startY + ( i + 1 ) * this.cellHeight );
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
			this.pjs.fill( this.getCellColor( this.data[r][s] ) );
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
	annotationBox.innerHTML += 'Value: ' + this.data[this.mouseRow][this.mouseColumn] + '</br>';
	annotationBox.innerHTML += 'Sample Name: ' + this.columnNames[this.mouseColumn] + '</br>';
	for( var i = 0; i < this.annotations[0].length; i++ ){
		annotationBox.innerHTML += this.annotations[0][i] + ': ' + this.annotations[this.mouseRow + 1][i] + '</br>';
	}

}

function init( fck ){
	canvas = document.getElementById('canvas');	
	annotationBox = document.getElementById('annotations');
	var processingInstance = new Processing( canvas, sketch );
	clusterfckLocal = fck;
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

function cluster( data ){
	console.log( "Start" );

	var test = [
	
	[10,20,30],
	[11,19,32],
	[9, 21, 34],
	[2,3,4],
	[3,2,5]
	
	];

	var clusters = clusterfck.hcluster( data, clusterfck.EUCLIDEAN_DISTANCE, clusterfck.AVERAGE_LINKAGE );
	console.log( clusters );
	
	var output = [];
	
	output = outputCluster( clusters, output );
	return output;
	//console.log( "Ended" );
}

function outputCluster( clusters, output ){

	console.log("left:");
	console.log( clusters.canonical );

	if( clusters.left !== null ){
	
		output.concat( outputCluster( clusters.left, output ) );
	
	}
	if( clusters.right !== null ){
	
		output.concat( outputCluster( clusters.right, output ) );
	
	}
	else{
	
		output.concat( outputCluster( clusters.canonical, output ) );
	
	}

}





