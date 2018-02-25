module.exports = {
  csvValidation: function(data, callback) {
  	
  	// If given data is not an array
  	if(typeof data === "string" && data.trim().match(/^["=\-+@]/)){
  	    var tab = !data.includes('"');

        while (data.includes('"')) {
            data = data.replace('"', "'");
        }

  		data = (tab ?  "\t" : "") + data;
  		return callback(data);
  	}

    for (column in data) {
    	if(typeof data[column] === "string" && data[column].trim().match(/^["=\-+@]/)) {

    	    var tab = !data[column].includes('"');

            while (data[column].includes('"')) {
                data[column] = data[column].replace('"', "'");
            }

    		data[column] = (tab ?  "\t" : "") + data[column];
    	}
    }
     callback(data);
}
};