
function complete_api_url(api_url){

	var host = window.location.host;
	url = '//' + host + api_url;

	if (host.indexOf('localhost') == 0)
		return url
	else
		return 'https:' + url;
}