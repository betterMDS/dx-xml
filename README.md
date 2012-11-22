dx-xml

Acknowledgements
----------------

Author: Mike Wilcox

Email: mike.wilcox@bettervideo.com

Website: http://bettervideo.com

dx-xml is freely available under the same dual BSD/AFLv2 license as the Dojo Toolkit.

Usage
-----

Get some XML via an XHR, pass it to the lib like:

```javascript
require('xml', function(xml){
	var object = xml.toObject(response.xml, options);
});
```

Dependencies
------------

dx-xml has no dependencies. It will load via AMD if available, or if not, will
create a global: "xmlToObject".

Description
-----------
By default one node equals one object, and can lead to a lot of testing if you
need to check if it's an array or not. "options" can include "arrayNodeNames",
which are names of nodes that you expect to be an array.

An XML node is treated as an object and its attributes are set as properties.
This leaves what the value of the node is, or, the data in between the tags. By
default this is assigned to the property "value". If you wish it to be something
else, set "textProperty" in the options.

NOTE
----

This code is very alpha. The intent was to clean it up before posting, but some
friends needed it. If you stumble across this enjoy - but my intent is to make
it better. API shouldn't change much if at all.

License
-------

dx-xml is available via Academic Free License >= 2.1 OR the
modified BSD license. see: [http://dojotoolkit.org/license]
(http://bugs.dojotoolkit.org/browser/dojo/trunk/LICENSE) for details
