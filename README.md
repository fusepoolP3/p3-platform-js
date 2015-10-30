# p3-platform-js

The main task of this JavaScript library is to provide an easy way to get the basic configuration information about the platform and use simple functionalities such as transformer registration.

Requires [jQuery](https://github.com/jquery/jquery) and [RDF-Store](https://github.com/antoniogarrote/rdfstore-js).

The library provides a class, **P3Platform** with a method **getPlatform** taking the URI of the platform as single argument. This method returns a Promise for a platform. When the promise is fulfilled, a platform instance is available which provides method to access the URI of sparql endpoint URI as well as the registries. The methods returning registries in turn return promises for registries. A registry is an object allowing to access the entries in the registry as well as to add new Entry.

Example usage:

    P3Platform.getPlatform("http://localhost:8080").then(function(p) {
     console.log("SPARQL endpoint: " + p.getSparqlEndpoint());
     console.log("Transformer Registry " + p.getTransformerRegistryURI()); 
     p.getTransformerRegistry().then(function(tr) {
      tr.registerTransformer("http://transformer.example.org", "My New Transformer", "Description...");
     });
     p.getTransformerFactoryRegistry().then(function(tfr) {
      tfr.registerTransformerFactory("http://transformer.example.org", "My New Transformer Factory");
     });
    });
