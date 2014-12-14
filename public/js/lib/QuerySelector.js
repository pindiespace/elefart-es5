/* 
 * @namespace
 * QuerySelector.js
 * polyfill for queries that doesn't assume IE is being used
 * @link http://codereview.stackexchange.com/questions/12444/queryselectorall-shim-for-non-ie-browsers
 * @link 
 */
if(typeof document.querySelector == "undefined") {
    document.querySelectorAll = function(sel) {
        var sels = sel.split(","),
            run = function(node,selector) {
                var sel = selector.split(/[ >]+/), com = selector.match(/[ >]+/g) || [], s, c, ret = [node], nodes, l, i, subs, m, j, check, x, w, ok,
                    as;
                com.unshift(" ");
                while(s = sel.shift()) {
                    c = com.shift();
                    if( c) c = c.replace(/^ +| +$/g,"");
                    nodes = ret.slice(0);
                    ret = [];
                    l = nodes.length;
                    subs = s.match(/[#.[]?[a-z_-]+(?:='[^']+'|="[^"]+")?]?/gi);
                    m = subs.length;
                    for( i=0; i<l; i++) {
                        if( subs[0].charAt(0) == "#") ret = [document.getElementById(subs[0].substr(1))];
                        else {
                            check = c == ">" ? nodes[i].children : nodes[i].getElementsByTagName("*");
                            if( !check) continue;
                            w = check.length;
                            for( x=0; x<w; x++) {
                                ok = true;
                                for( j=0; j<m; j++) {
                                    switch(subs[j].charAt(0)) {
                                    case ".":
                                        if( !check[x].className.match(new RegExp("\\b"+subs[j].substr(1)+"\\b"))) ok = false;
                                        break;
                                    case "[":
                                        as = subs[j].substr(1,subs[j].length-2).split("=");
                                        if( !check[x].getAttribute(as[0])) ok = false;
                                        else if( as[1]) {
                                            as[1] = as[1].replace(/^['"]|['"]$/g,"");
                                            if( check[x].getAttribute(as[0]) != as[1]) ok = false;
                                        }
                                        break;
                                    default:
                                        if( check[x].tagName.toLowerCase() != subs[j].toLowerCase()) ok = false;
                                        break;
                                    }
                                    if( !ok) break;
                                }
                                if( ok) ret.push(check[x]);
                            }
                        }
                    }
                }
                return ret;
            }, l = sels.length, i, ret = [], tmp, m, j;
        for( i=0; i<l; i++) {
            tmp = run(this,sels[i]);
            m = tmp.length;
            for( j=0; j<m; j++) {
                ret.push(tmp[j]);
            }
        }
        return ret;
    };
    document.querySelector = function(sel) {
        var ret = this.querySelectorAll(sel);
        if( ret.length > 0) return ret[0];
        else return null;
    };

    if( typeof HTMLElement != "undefined") {
        HTMLElement.prototype.querySelector = document.querySelector;
        HTMLElement.prototype.querySelectorAll = document.querySelectorAll;
        HTMLElement.prototype.getElementsByClassName = document.getELementsByClassName;
    }
    else {
            var a = document.getElementsByTagName("*"), len = a.length, i;
            for( i=0; i<len; i++) {
                a[i].querySelector = document.querySelector;
                a[i].querySelectorAll = document.querySelectorAll;
            }
    }
}
