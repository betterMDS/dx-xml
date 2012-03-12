(function(define){
define([

], function(){
	var log = function(){
		//console.log.apply(console, arguments);
	};

	var isArray = function(obj){
		return obj instanceof Array;
	}

	var trim = function(str){
		return !str ?
				str :
				str.trim ?
					str.trim() :
					str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	var normalize = function(v){
		v = trim(v);
		if(v == "true") return true;
		if(v == "false") return false;
		if(v.substring(0,1) == "0") return v; // 001 id
		if(Number(v) == v) return Number(v);
		return v;
	}

	var copy = function(o){
		var o1 = {};
		for(var nm in o){
			if(typeof(o[nm]) == "object"){
				o1[nm] = this.copy(o[nm])
			}else{
				o1[nm] = o[nm]
			}
		}
		return o1;
	}

	var mix = function(o1, o2, copy){ // not deep!
		if(copy) o1 = this.copy(o1);
		if(!o2){
			o2 = o1; o1 = this;
		}
		for(var nm in o2){
			o1[nm] = o2[nm];
		}
		return o1;
	}

	var isIE = function(){
		return /MSIE/.test(navigator.userAgent);
	}

	var xml = {
		// node names that are expected to be an array, even if only one node
		arrayNodeNames:[],

		// What property name to assign the innerText
		textProperty:"value",

		toObject: function(node, options) {
			log("toObject...")
			options = options || {};
			this.arrayNodeNames = options.arrayNodeNames || this.arrayNodeNames;
			this.textProperty = (options.textProperty) ? options.textProperty : "value";
			node = this.getRootNode(node);
			node = this.stripComments(node);

			if(!isIE()){ //IE ignores white space
				this.stripWhiteSpace(node);
			}

			var o = {};
			try{
			o[this.getLocalName(node)] = this.objectFromXML(node);
			if(this.hasAtts(node)){
				mix(o[this.getLocalName(node)], this.getAttributes(node));
			}
			}catch(e){
				console.error("Error Parsing XML:", e);
			}
			return o;
		},


		hasAtts: function (node){
			return (node.nodeType==1 && node.attributes && node.attributes.length > 0);
		},

		getAttributes: function(node){
			var attOb = {};
			if (this.hasAtts(node)){
				var atts = node.attributes;
				//log("..........atts: " + atts.length);
				for(var i=0; i<atts.length; i++) {
					if( atts[i].nodeName.indexOf("xmlns:") == 0 ||	// Namespace declaration
						atts[i].nodeName.indexOf("xml:") == 0 ||		// xml namespace attributes (special attributes)
						atts[i].nodeName == "xmlns")					// Default namespace declaration
					{
						continue ;
					}
					//log(" Add Att Obj")
					//log(" Obj:", attOb[this.getLocalName(atts[i])])
					//log(" Att:", node.attributes[i].nodeValue)
					attOb[this.getLocalName(atts[i])] = atts[i].nodeValue;
					hasAtts = true ;
					//log("    at... ", this.getLocalName(atts[i]))
				}
				return attOb;
			}
			return {};
		},

		objectFromXML: function(node) {

			var o = {};

			//log("jxml node:", node)
			//log("jxml type:", node.nodeType)
			//log(node.attributes, node.attributes.length)

			// handle attributes
			var hasAtts = this.hasAtts(node);
			if(hasAtts){
				o = this.getAttributes(node);
			}
			//log("hasChildren....", node)
			//log("hasChildren:", node.hasChildNodes())

			if(!node.childNodes[0]){
				return hasAtts ? o : "" ;
			}


			var nm = node.childNodes[0].nodeName;
			// walk the tree
			for (var i = 0; i < node.childNodes.length; i++) {
				var n = node.childNodes[i];

				if(n.nodeType == 8){
					continue;
				}else if(n.nodeType == 4){
					//log("CDATA...");log("node: ", n);log("node ch: ", n.childNodes);
					//log("node: ", n)
					if(hasAtts) {
						//log(" CDATA HAS ATTS!!!! :", o)
						o[this.textProperty] = normalize(n.nodeValue);
						return o;
					}
					return  normalize(n.nodeValue);
				}else if(node.childNodes.length == 1 && n.nodeType == 3){
					//one node and it's text
					//log("TEXT...")
					if(hasAtts){
						//log(" TEXT HAS ATTS!!!!")
						o[this.textProperty] = normalize(n.nodeValue);
						return o;
					}
					return  normalize(n.nodeValue);
				}else{

					nm = this.getLocalName(n) ;

					if(o[nm]){
						//log(" localName:", nm, o[nm], isArray(o[nm]))
					}

					if(o[nm] && !isArray(o[nm])){
						// ran into a second instance of an object.
						// Convert the name to an array and add the previous object
						o[nm] = [ copy(o[nm]) ];
							log("Made array: ", nm, o[nm], this.arrayNodeNames)
							this.arrayNodeNames.push(nm);
						o[nm].push(this.objectFromXML(n))
						log("new array: ", o[nm])
					}else{

						log("OBJECT: "+nm, "is array: ", this.exists(this.arrayNodeNames, nm));
						if(this.exists(this.arrayNodeNames, nm)){
							log("exists")
							// handle this.arrayNodeNames (see above)
							if(!isArray(o[nm])){
								o[nm] = [];
							}
							o[nm].push(this.objectFromXML(n));
						}else{
							log(" does not exist, object.")
							// object
							log(" NM:", nm, node.nodeType);
							o[nm] = this.objectFromXML(n);
						}
					}

				}
			}
			return o;
		},

		/*==========================================================================

			Helper Functions

		==========================================================================*/


		exists: function(ar, nm){
			for(var i=0; i<ar.length; i++){
				if(ar[i] == nm) return true;
			}
			return false;
		},

		getLocalName: function(n){
			if (window.ActiveXObject) {
				var nodeName = n.nodeName ;
				if(nodeName.indexOf(":") != -1){
					return nodeName.slice(nodeName.indexOf(":")+1) ;
					return nodeName ;
				}
			}else if (document.implementation && document.implementation.createDocument){
				return n.localName ;
			}else{

			}

			return n.nodeName ;
		},

		isWhite: function(node) {
			return !(/[^\t\n\r ]/.test(node.nodeValue));
		},

		findWhiteSpace: function(node) {
			var wsNodes = [];
			for (var i=0; i<node.childNodes.length; i++) {
				var n = node.childNodes[i];
				if (n.nodeType == 3 && this.isWhite(n)) {
					wsNodes.push(n)
				}
				if (n.hasChildNodes()) {
					wsNodes = wsNodes.concat(this.findWhiteSpace(n));
				}
			}
			node = node.parentNode;
			return wsNodes;
		},

		stripWhiteSpace: function(node) {
			var delNodes = this.findWhiteSpace(node);
			for(var i=delNodes.length-1;i>=0;i--) {
				var nodeRef = delNodes[i];
				nodeRef.parentNode.removeChild(nodeRef);
			}
		},

		collect: function(node, type){
			var nodes = [];
			for (var i=0; i<node.childNodes.length; i++) {
				var n = node.childNodes[i];
				//log("type:", n.nodeType, type, n.nodeType == type)
				if(n.nodeType == type){
					nodes.push(n);
				}else if (n.hasChildNodes()) {
					nodes = nodes.concat(this.collect(n, type));
				}
			}
			return nodes;

		},

		stripComments: function(node){
			var nodes = this.collect(node, 8);
			//log("nodes to strip:", nodes)
			//for (var i=0; i<nodes.length; i++) {
			for(var i=nodes.length-1;i>=0;i--) {
				nodes[i].parentNode.removeChild(nodes[i]);
			}
			return node;
		},

		getRootNode: function(node){
			// firstChild after <?xml version="1.0" encoding="UTF-8"?>
			// or in IE's case, the nextSibling after a
			//	processing instruction node
			//
			while(node.nodeType == 9 || node.nodeType == 8 || node.nodeType == 7){
				node = (node.nodeType == 7 || node.nodeType == 8) ? node.nextSibling : node.firstChild;
				log("   get root:", node.nodeType);
			}
			return node;
		}
	};

	return xml;


});
})(typeof define == "undefined" ? function(deps, factory){
	timer = factory();
} : define);
