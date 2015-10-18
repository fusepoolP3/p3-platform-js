
function P3Platform() {
	if (typeof rdfstore === 'undefined' || typeof jQuery === 'undefined') {
			console.error("You must include jQuery and RDFStore JS libraries.");
	}
}

P3Platform.prototype.getPlatform = function (platformURI) {

	/* ************************* Platform ************************* */
	function Platform(URI, title, comment, label, sparqlEndpoint, userInteractionRequestRegistry, transformerFactoryRegistry, transformerRegistry, dashboardConfigRegistry) {
		this.URI = URI;
		this.title = title;
		this.comment = comment;
		this.label = label;
		this.sparqlEndpoint = sparqlEndpoint;
		this.userInteractionRequestRegistry = userInteractionRequestRegistry;
		this.transformerFactoryRegistry = transformerFactoryRegistry;
		this.transformerRegistry = transformerRegistry;
		this.dashboardConfigRegistry = dashboardConfigRegistry;
	}
	Platform.prototype.getPlatformURI = function () { return this.URI; };
	Platform.prototype.getSparqlEndpoint = function () { return this.sparqlEndpoint; };
	Platform.prototype.getUserInteractionRegistryURI = function () { return this.userInteractionRequestRegistry; };
	Platform.prototype.getTransformerFactoryRegistry = function () {
		var main = this;
    return new Promise(function (resolve, reject) {
			resolve(main.transformerFactoryRegistry);
		});
	};
	Platform.prototype.getTransformerFactoryRegistryURI = function () { return this.transformerFactoryRegistry.URI; };
	Platform.prototype.getTransformerRegistry = function () {
		var main = this;
    return new Promise(function (resolve, reject) {
			resolve(main.transformerRegistry);
		});
	};
	Platform.prototype.getTransformerRegistryURI = function () { return this.transformerRegistry.URI; };
	Platform.prototype.getDashboardConfigRegistryURI = function () { return this.dashboardConfigRegistry; };
	
	/* ************************* TransformerRegistry ************************* */
	function TransformerRegistry(transformerRegistryURI) {
		this.URI = transformerRegistryURI;
	}
	TransformerRegistry.prototype.registerTransformer = function (transformerURI, title) {
		var main = this;
		return new Promise(function (resolve, reject) {

			var data = '@prefix dcterms: <http://purl.org/dc/terms/> . '
							+ '@prefix trldpc: <http://vocab.fusepool.info/trldpc#> . '
							+ '@prefix ldp: <http://www.w3.org/ns/ldp#> . '
							+ '<> a ldp:Container, ldp:BasicContainer, trldpc:TransformerRegistration; '
							+ 'trldpc:transformer <' + transformerURI + '>; '
							+ 'dcterms:title "' + title + '"@en; '
							+ 'dcterms:description "" . ';

			$.ajax({
					type: 'POST',
					headers: { 'Content-Type': 'text/turtle' },
					url: main.URI,
					data: data,
					async: true
			}).done(function (response) {
				resolve(true);
			}).fail(function (xhr, textStatus, errorThrown) {
				reject(Error("error " + xhr.status));
			});
		});
	};
	
	/* ************************* TransformerFactoryRegistry ************************* */
	function TransformerFactoryRegistry(transformerFactoryRegistryURI) {
		this.URI = transformerFactoryRegistryURI;
	}
	TransformerFactoryRegistry.prototype.registerTransformerFactory = function (transformerFactoryURI, title) {
		var main = this;
		return new Promise(function (resolve, reject) {

			var data = '@prefix dcterms: <http://purl.org/dc/terms/> . '
							+ '@prefix tfrldpc: <http://vocab.fusepool.info/tfrldpc#> . '
							+ '@prefix ldp: <http://www.w3.org/ns/ldp#> . '
							+ '<> a ldp:Container, ldp:BasicContainer, tfrldpc:TransformerFactoryRegistration; '
							+ 'tfrldpc:transformerFactory <' + transformerFactoryURI + '>; '
							+ 'dcterms:title "' + title + '"@en; '
							+ 'dcterms:description "" . ';

			$.ajax({
					type: 'POST',
					headers: { 'Content-Type': 'text/turtle' },
					url: main.URI,
					data: data,
					async: true
			}).done(function (response) {
				resolve(true);
			}).fail(function (xhr, textStatus, errorThrown) {
				reject(Error("error " + xhr.status));
			});
		});
	};

	var main = this;
  return new Promise(function (resolve, reject) {
		
		var ajaxRequest = jQuery.ajax({type: "GET", url: platformURI, async: true});
		
		ajaxRequest.done(function (response, textStatus, responseObj) {
			var configStore = rdfstore.create();
			configStore.load('text/turtle', response, function (success) {
				if (success) {
					var query = "PREFIX dcterms: <http://purl.org/dc/terms/> " +
											"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
											"PREFIX fp3: <http://vocab.fusepool.info/fp3#> " +
											"SELECT * { " +
//											" ?s dcterms:title ?title . " +
//											" ?s rdfs:comment ?comment . " +
//											" ?s rdfs:label ?label . " +
											" ?s fp3:sparqlEndpoint ?sparqlEndpoint . " +
											" ?s fp3:userInteractionRequestRegistry ?userInteractionRequestRegistry . " +
											" ?s fp3:transformerFactoryRegistry ?transformerFactoryRegistry . " +
											" ?s fp3:transformerRegistry ?transformerRegistry . " +
											" ?s fp3:dashboardConfigRegistry ?dashboardConfigRegistry . " +
											"}";
					
					configStore.execute(query, function (success, res) {
						if (success) {
							var title = "title";//res[0].title.value;
							var comment = "comment";//res[0].comment.value;
							var label = "label"; //res[0].label.value;
							var sparqlEndpoint = res[0].sparqlEndpoint.value;
							var userInteractionRequestRegistry = res[0].userInteractionRequestRegistry.value;
							var transformerFactoryRegistry = res[0].transformerFactoryRegistry.value;
							var transformerRegistry = res[0].transformerRegistry.value;
							var dashboardConfigRegistry = res[0].dashboardConfigRegistry.value;
							
							var transformerRegistryObj = new TransformerRegistry(transformerRegistry);
							var transformerFactoryRegistryObj = new TransformerFactoryRegistry(transformerFactoryRegistry);
							
							var platform = new Platform(platformURI, title, comment, label, sparqlEndpoint,
																				userInteractionRequestRegistry, transformerFactoryRegistryObj,
																				transformerRegistryObj, dashboardConfigRegistry);
							
							resolve(platform);
						}
						else {
							reject(Error("RDFStore issue during executing a query."));
						}
					});
				}
				else {
					reject(Error("RDFStore issue during loading result to store."));
				}
			});
		});
		ajaxRequest.fail(function (responseObj, textStatus, response) {
			reject(Error("error " + responseObj.status));
		});
	});
};

var P3Platform = new P3Platform();
