!function(t){var r={};function i(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=r,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(n,e){if(1&e&&(n=i(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var r in n)i.d(t,r,function(e){return n[e]}.bind(null,r));return t},i.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="",i(i.s=0)}([function(e,n){var t,r,i;!function(){r=new THREE.Scene,(t=new THREE.WebGLRenderer({antialias:!0,canvas:document.querySelector("canvas")})).setPixelRatio(window.devicePixelRatio),t.setSize(window.innerWidth,window.innerHeight);var e=new THREE.DirectionalLight(16777215,.5);e.position.set(-1,-1,1),r.add(e),r.add(new THREE.AmbientLight(4210752)),(i=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1e4)).position.set(0,25,125)}(),function e(){requestAnimationFrame(e);t.render(r,i)}()}]);