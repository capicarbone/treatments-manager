
function complete_api_url(api_url){

	var host = window.location.host;
	url = '//' + host + api_url;

	if (host.indexOf('localhost') == 0)
		return url
	else
		return 'https:' + url;
}

Utils = {

	messageForBlank: function(field){

		if (!field || field == "" || field == " " )
			return "No especificado.";

		return field;
	}
}

// Courtesy of Steve Hansell

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}