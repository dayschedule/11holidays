import t from"axios";function e(){return e=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&(t[i]=r[i])}return t},e.apply(this,arguments)}var r=/*#__PURE__*/function(){function r(t){this.baseUrl="https://api.11holidays.com/v1",this.apiKey=void 0,this.apiKey=t}var i=r.prototype;return i.get=function(r,i){try{return Promise.resolve(t.get(""+this.baseUrl+r,{params:e({apiKey:this.apiKey},i)})).then(function(t){return t.data})}catch(t){return Promise.reject(t)}},i.post=function(r,i,n){try{return Promise.resolve(t.post(""+this.baseUrl+r,i,{params:e({apiKey:this.apiKey},n)})).then(function(t){return t.data})}catch(t){return Promise.reject(t)}},i.put=function(r,i,n){try{return Promise.resolve(t.put(""+this.baseUrl+r,i,{params:e({apiKey:this.apiKey},n)})).then(function(t){return t.data})}catch(t){return Promise.reject(t)}},i.delete=function(r,i){try{return Promise.resolve(t.delete(""+this.baseUrl+r,{params:e({apiKey:this.apiKey},i)})).then(function(t){return t.data})}catch(t){return Promise.reject(t)}},r}(),i=/*#__PURE__*/function(){function t(t){this.api=void 0,this.api=t}var e=t.prototype;return e.list=function(t){void 0===t&&(t=void 0);try{return Promise.resolve(this.api.get("/holidays",t))}catch(t){return Promise.reject(t)}},e.get=function(t){try{return Promise.resolve(this.api.get("/holidays/"+t))}catch(t){return Promise.reject(t)}},t}(),n=/*#__PURE__*/function(){function t(t){this.api=void 0,this.api=t}var e=t.prototype;return e.list=function(t){void 0===t&&(t=void 0);try{return Promise.resolve(this.api.get("/countries",t))}catch(t){return Promise.reject(t)}},e.get=function(t){try{return Promise.resolve(this.api.get("/countries/"+t))}catch(t){return Promise.reject(t)}},t}(),o=function(t){this.api=void 0,this.holidays=void 0,this.countries=void 0,this.api=new r(t),this.holidays=new i(this.api),this.countries=new n(this.api)};export{o as default};