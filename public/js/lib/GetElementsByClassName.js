if (!document.getElementsByClassName) {

	window.bob = document.getElementsByTagName("article")[0];

	document.getElementsByClassName = function (search) {
		var d = this, elements = [], pattern, i, results = [];


		function getChildren(node, func) {
			func(node);
			node = node.firstChild;
			while (node) {
				getChildren(node, func);
				node = node.nextSibling;
			}
		}

		// Example usage: Process all Text nodes on the page
		getChildren(d, function (node) {
			console.log("elements is a:" + typeof elements);
			if (node.nodeType === 1) { //tag node
				elements.push(node);
			}
		});


		//elements = d.getElementsByTagName("*");

		console.log("elements length:" + elements.length)
		pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
		for (i = 0; i < elements.length; i++) {
			if (pattern.test(elements[i].className)) {
				results.push(elements[i]);
			}
		}
		console.log("results length:" + results.length);
		return results;
	}


	if(typeof HTMLElement != "undefined") {
		HTMLElement.prototype.getElementsByClassName = document.getElementsByClassName;
	}
	else {
		var a = document.getElementsByTagName("*"), l = a.length, i;
		for( i=0; i<l; i++) {
			a[i].getElementsByClassName = document.getElementsByClassName;
		}
	}

}

