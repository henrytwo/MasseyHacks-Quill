module.exports = {
  csvValidation: function(data, callback) {
  	
  	// If given data is not an array
  	if(typeof data === "string" && data.trim().match(/^["=\-+@]/)){
  		data =  "\t"  + data;
  		return callback(data);
  	}

    for (column in data) {
    	if(typeof data[column] === "string" && data[column].trim().match(/^["=\-+@]/)) {
    		data[column] = "\t" + data[column];
    	}
    }
     callback(data);
}
};