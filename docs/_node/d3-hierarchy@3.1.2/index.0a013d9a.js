function sn(n,r){return n.parent===r.parent?1:2}function pn(n){return n.reduce(dn,0)/n.length}function dn(n,r){return n+r.x}function gn(n){return 1+n.reduce(vn,0)}function vn(n,r){return Math.max(n,r.y)}function yn(n){for(var r;r=n.children;)n=r[0];return n}function xn(n){for(var r;r=n.children;)n=r[r.length-1];return n}function mn(){var n=sn,r=1,t=1,e=!1;function u(i){var f,l=0;i.eachAfter(function(o){var p=o.children;p?(o.x=pn(p),o.y=gn(p)):(o.x=f?l+=n(o,f):0,o.y=0,f=o)});var c=yn(i),a=xn(i),h=c.x-n(c,a)/2,s=a.x+n(a,c)/2;return i.eachAfter(e?function(o){o.x=(o.x-i.x)*r,o.y=(i.y-o.y)*t}:function(o){o.x=(o.x-h)/(s-h)*r,o.y=(1-(i.y?o.y/i.y:1))*t})}return u.separation=function(i){return arguments.length?(n=i,u):n},u.size=function(i){return arguments.length?(e=!1,r=+i[0],t=+i[1],u):e?null:[r,t]},u.nodeSize=function(i){return arguments.length?(e=!0,r=+i[0],t=+i[1],u):e?[r,t]:null},u}function $n(n){var r=0,t=n.children,e=t&&t.length;if(!e)r=1;else for(;--e>=0;)r+=t[e].value;n.value=r}function wn(){return this.eachAfter($n)}function Bn(n,r){let t=-1;for(const e of this)n.call(r,e,++t,this);return this}function _n(n,r){for(var t=this,e=[t],u,i,f=-1;t=e.pop();)if(n.call(r,t,++f,this),u=t.children)for(i=u.length-1;i>=0;--i)e.push(u[i]);return this}function An(n,r){for(var t=this,e=[t],u=[],i,f,l,c=-1;t=e.pop();)if(u.push(t),i=t.children)for(f=0,l=i.length;f<l;++f)e.push(i[f]);for(;t=u.pop();)n.call(r,t,++c,this);return this}function Mn(n,r){let t=-1;for(const e of this)if(n.call(r,e,++t,this))return e}function zn(n){return this.eachAfter(function(r){for(var t=+n(r.data)||0,e=r.children,u=e&&e.length;--u>=0;)t+=e[u].value;r.value=t})}function kn(n){return this.eachBefore(function(r){r.children&&r.children.sort(n)})}function En(n){for(var r=this,t=Sn(r,n),e=[r];r!==t;)r=r.parent,e.push(r);for(var u=e.length;n!==t;)e.splice(u,0,n),n=n.parent;return e}function Sn(n,r){if(n===r)return n;var t=n.ancestors(),e=r.ancestors(),u=null;for(n=t.pop(),r=e.pop();n===r;)u=n,n=t.pop(),r=e.pop();return u}function qn(){for(var n=this,r=[n];n=n.parent;)r.push(n);return r}function bn(){return Array.from(this)}function In(){var n=[];return this.eachBefore(function(r){r.children||n.push(r)}),n}function Dn(){var n=this,r=[];return n.each(function(t){t!==n&&r.push({source:t.parent,target:t})}),r}function*jn(){var n=this,r,t=[n],e,u,i;do for(r=t.reverse(),t=[];n=r.pop();)if(yield n,e=n.children)for(u=0,i=e.length;u<i;++u)t.push(e[u]);while(t.length)}function C(n,r){n instanceof Map?(n=[void 0,n],r===void 0&&(r=On)):r===void 0&&(r=Nn);for(var t=new k(n),e,u=[t],i,f,l,c;e=u.pop();)if((f=r(e.data))&&(c=(f=Array.from(f)).length))for(e.children=f,l=c-1;l>=0;--l)u.push(i=f[l]=new k(f[l])),i.parent=e,i.depth=e.depth+1;return t.eachBefore(Q)}function Rn(){return C(this).eachBefore(Tn)}function Nn(n){return n.children}function On(n){return Array.isArray(n)?n[1]:null}function Tn(n){n.data.value!==void 0&&(n.value=n.data.value),n.data=n.data.data}function Q(n){var r=0;do n.height=r;while((n=n.parent)&&n.height<++r)}function k(n){this.data=n,this.depth=this.height=0,this.parent=null}k.prototype=C.prototype={constructor:k,count:wn,each:Bn,eachAfter:An,eachBefore:_n,find:Mn,sum:zn,sort:kn,path:En,ancestors:qn,descendants:bn,leaves:In,links:Dn,copy:Rn,[Symbol.iterator]:jn};function D(n){return n==null?null:U(n)}function U(n){if(typeof n!="function")throw new Error;return n}function E(){return 0}function q(n){return function(){return n}}function K(){let n=1;return()=>(n=(1664525*n+1013904223)%4294967296)/4294967296}function Cn(n){return typeof n=="object"&&"length"in n?n:Array.from(n)}function Kn(n,r){let t=n.length,e,u;for(;t;)u=r()*t--|0,e=n[t],n[t]=n[u],n[u]=e;return n}function Ln(n){return X(n,K())}function X(n,r){for(var t=0,e=(n=Kn(Array.from(n),r)).length,u=[],i,f;t<e;)i=n[t],f&&Y(f,i)?++t:(f=Wn(u=Pn(u,i)),t=0);return f}function Pn(n,r){var t,e;if(L(r,n))return[r];for(t=0;t<n.length;++t)if(j(r,n[t])&&L(b(n[t],r),n))return[n[t],r];for(t=0;t<n.length-1;++t)for(e=t+1;e<n.length;++e)if(j(b(n[t],n[e]),r)&&j(b(n[t],r),n[e])&&j(b(n[e],r),n[t])&&L(Z(n[t],n[e],r),n))return[n[t],n[e],r];throw new Error}function j(n,r){var t=n.r-r.r,e=r.x-n.x,u=r.y-n.y;return t<0||t*t<e*e+u*u}function Y(n,r){var t=n.r-r.r+Math.max(n.r,r.r,1)*1e-9,e=r.x-n.x,u=r.y-n.y;return t>0&&t*t>e*e+u*u}function L(n,r){for(var t=0;t<r.length;++t)if(!Y(n,r[t]))return!1;return!0}function Wn(n){switch(n.length){case 1:return Fn(n[0]);case 2:return b(n[0],n[1]);case 3:return Z(n[0],n[1],n[2])}}function Fn(n){return{x:n.x,y:n.y,r:n.r}}function b(n,r){var t=n.x,e=n.y,u=n.r,i=r.x,f=r.y,l=r.r,c=i-t,a=f-e,h=l-u,s=Math.sqrt(c*c+a*a);return{x:(t+i+c/s*h)/2,y:(e+f+a/s*h)/2,r:(s+u+l)/2}}function Z(n,r,t){var e=n.x,u=n.y,i=n.r,f=r.x,l=r.y,c=r.r,a=t.x,h=t.y,s=t.r,o=e-f,p=e-a,d=u-l,g=u-h,v=c-i,y=s-i,x=e*e+u*u-i*i,w=x-f*f-l*l+c*c,$=x-a*a-h*h+s*s,m=p*d-o*g,B=(d*$-g*w)/(m*2)-e,M=(g*v-d*y)/m,_=(p*w-o*$)/(m*2)-u,A=(o*y-p*v)/m,S=M*M+A*A-1,z=2*(i+B*M+_*A),J=B*B+_*_-i*i,T=-(Math.abs(S)>1e-6?(z+Math.sqrt(z*z-4*S*J))/(2*S):J/z);return{x:e+B+M*T,y:u+_+A*T,r:T}}function V(n,r,t){var e=n.x-r.x,u,i,f=n.y-r.y,l,c,a=e*e+f*f;a?(i=r.r+t.r,i*=i,c=n.r+t.r,c*=c,i>c?(u=(a+c-i)/(2*a),l=Math.sqrt(Math.max(0,c/a-u*u)),t.x=n.x-u*e-l*f,t.y=n.y-u*f+l*e):(u=(a+i-c)/(2*a),l=Math.sqrt(Math.max(0,i/a-u*u)),t.x=r.x+u*e-l*f,t.y=r.y+u*f+l*e)):(t.x=r.x+t.r,t.y=r.y)}function nn(n,r){var t=n.r+r.r-1e-6,e=r.x-n.x,u=r.y-n.y;return t>0&&t*t>e*e+u*u}function rn(n){var r=n._,t=n.next._,e=r.r+t.r,u=(r.x*t.r+t.x*r.r)/e,i=(r.y*t.r+t.y*r.r)/e;return u*u+i*i}function R(n){this._=n,this.next=null,this.previous=null}function tn(n,r){if(!(i=(n=Cn(n)).length))return 0;var t,e,u,i,f,l,c,a,h,s,o;if(t=n[0],t.x=0,t.y=0,!(i>1))return t.r;if(e=n[1],t.x=-e.r,e.x=t.r,e.y=0,!(i>2))return t.r+e.r;V(e,t,u=n[2]),t=new R(t),e=new R(e),u=new R(u),t.next=u.previous=e,e.next=t.previous=u,u.next=e.previous=t;n:for(c=3;c<i;++c){V(t._,e._,u=n[c]),u=new R(u),a=e.next,h=t.previous,s=e._.r,o=t._.r;do if(s<=o){if(nn(a._,u._)){e=a,t.next=e,e.previous=t,--c;continue n}s+=a._.r,a=a.next}else{if(nn(h._,u._)){t=h,t.next=e,e.previous=t,--c;continue n}o+=h._.r,h=h.previous}while(a!==h.next);for(u.previous=t,u.next=e,t.next=e.previous=e=u,f=rn(t);(u=u.next)!==e;)(l=rn(u))<f&&(t=u,f=l);e=t.next}for(t=[e._],u=e;(u=u.next)!==e;)t.push(u._);for(u=X(t,r),c=0;c<i;++c)t=n[c],t.x-=u.x,t.y-=u.y;return u.r}function Gn(n){return tn(n,K()),n}function Hn(n){return Math.sqrt(n.value)}function Jn(){var n=null,r=1,t=1,e=E;function u(i){const f=K();return i.x=r/2,i.y=t/2,n?i.eachBefore(en(n)).eachAfter(P(e,.5,f)).eachBefore(un(1)):i.eachBefore(en(Hn)).eachAfter(P(E,1,f)).eachAfter(P(e,i.r/Math.min(r,t),f)).eachBefore(un(Math.min(r,t)/(2*i.r))),i}return u.radius=function(i){return arguments.length?(n=D(i),u):n},u.size=function(i){return arguments.length?(r=+i[0],t=+i[1],u):[r,t]},u.padding=function(i){return arguments.length?(e=typeof i=="function"?i:q(+i),u):e},u}function en(n){return function(r){r.children||(r.r=Math.max(0,+n(r)||0))}}function P(n,r,t){return function(e){if(u=e.children){var u,i,f=u.length,l=n(e)*r||0,c;if(l)for(i=0;i<f;++i)u[i].r+=l;if(c=tn(u,t),l)for(i=0;i<f;++i)u[i].r-=l;e.r=c+l}}}function un(n){return function(r){var t=r.parent;r.r*=n,t&&(r.x=t.x+n*r.x,r.y=t.y+n*r.y)}}function on(n){n.x0=Math.round(n.x0),n.y0=Math.round(n.y0),n.x1=Math.round(n.x1),n.y1=Math.round(n.y1)}function I(n,r,t,e,u){for(var i=n.children,f,l=-1,c=i.length,a=n.value&&(e-r)/n.value;++l<c;)f=i[l],f.y0=t,f.y1=u,f.x0=r,f.x1=r+=f.value*a}function Qn(){var n=1,r=1,t=0,e=!1;function u(f){var l=f.height+1;return f.x0=f.y0=t,f.x1=n,f.y1=r/l,f.eachBefore(i(r,l)),e&&f.eachBefore(on),f}function i(f,l){return function(c){c.children&&I(c,c.x0,f*(c.depth+1)/l,c.x1,f*(c.depth+2)/l);var a=c.x0,h=c.y0,s=c.x1-t,o=c.y1-t;s<a&&(a=s=(a+s)/2),o<h&&(h=o=(h+o)/2),c.x0=a,c.y0=h,c.x1=s,c.y1=o}}return u.round=function(f){return arguments.length?(e=!!f,u):e},u.size=function(f){return arguments.length?(n=+f[0],r=+f[1],u):[n,r]},u.padding=function(f){return arguments.length?(t=+f,u):t},u}var Un={depth:-1},an={},W={};function Xn(n){return n.id}function Yn(n){return n.parentId}function Zn(){var n=Xn,r=Yn,t;function e(u){var i=Array.from(u),f=n,l=r,c,a,h,s,o,p,d,g,v=new Map;if(t!=null){const y=i.map(($,m)=>Vn(t($,m,u))),x=y.map(fn),w=new Set(y).add("");for(const $ of x)w.has($)||(w.add($),y.push($),x.push(fn($)),i.push(W));f=($,m)=>y[m],l=($,m)=>x[m]}for(h=0,c=i.length;h<c;++h)a=i[h],p=i[h]=new k(a),(d=f(a,h,u))!=null&&(d+="")&&(g=p.id=d,v.set(g,v.has(g)?an:p)),(d=l(a,h,u))!=null&&(d+="")&&(p.parent=d);for(h=0;h<c;++h)if(p=i[h],d=p.parent){if(o=v.get(d),!o)throw new Error("missing: "+d);if(o===an)throw new Error("ambiguous: "+d);o.children?o.children.push(p):o.children=[p],p.parent=o}else{if(s)throw new Error("multiple roots");s=p}if(!s)throw new Error("no root");if(t!=null){for(;s.data===W&&s.children.length===1;)s=s.children[0],--c;for(let y=i.length-1;y>=0&&(p=i[y],p.data===W);--y)p.data=null}if(s.parent=Un,s.eachBefore(function(y){y.depth=y.parent.depth+1,--c}).eachBefore(Q),s.parent=null,c>0)throw new Error("cycle");return s}return e.id=function(u){return arguments.length?(n=D(u),e):n},e.parentId=function(u){return arguments.length?(r=D(u),e):r},e.path=function(u){return arguments.length?(t=D(u),e):t},e}function Vn(n){n=`${n}`;let r=n.length;return F(n,r-1)&&!F(n,r-2)&&(n=n.slice(0,-1)),n[0]==="/"?n:`/${n}`}function fn(n){let r=n.length;if(r<2)return"";for(;--r>1&&!F(n,r););return n.slice(0,r)}function F(n,r){if(n[r]==="/"){let t=0;for(;r>0&&n[--r]==="\\";)++t;if(!(t&1))return!0}return!1}function nr(n,r){return n.parent===r.parent?1:2}function G(n){var r=n.children;return r?r[0]:n.t}function H(n){var r=n.children;return r?r[r.length-1]:n.t}function rr(n,r,t){var e=t/(r.i-n.i);r.c-=e,r.s+=t,n.c+=e,r.z+=t,r.m+=t}function tr(n){for(var r=0,t=0,e=n.children,u=e.length,i;--u>=0;)i=e[u],i.z+=r,i.m+=r,r+=i.s+(t+=i.c)}function er(n,r,t){return n.a.parent===r.parent?n.a:t}function N(n,r){this._=n,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=r}N.prototype=Object.create(k.prototype);function ur(n){for(var r=new N(n,0),t,e=[r],u,i,f,l;t=e.pop();)if(i=t._.children)for(t.children=new Array(l=i.length),f=l-1;f>=0;--f)e.push(u=t.children[f]=new N(i[f],f)),u.parent=t;return(r.parent=new N(null,0)).children=[r],r}function ir(){var n=nr,r=1,t=1,e=null;function u(a){var h=ur(a);if(h.eachAfter(i),h.parent.m=-h.z,h.eachBefore(f),e)a.eachBefore(c);else{var s=a,o=a,p=a;a.eachBefore(function(x){x.x<s.x&&(s=x),x.x>o.x&&(o=x),x.depth>p.depth&&(p=x)});var d=s===o?1:n(s,o)/2,g=d-s.x,v=r/(o.x+d+g),y=t/(p.depth||1);a.eachBefore(function(x){x.x=(x.x+g)*v,x.y=x.depth*y})}return a}function i(a){var h=a.children,s=a.parent.children,o=a.i?s[a.i-1]:null;if(h){tr(a);var p=(h[0].z+h[h.length-1].z)/2;o?(a.z=o.z+n(a._,o._),a.m=a.z-p):a.z=p}else o&&(a.z=o.z+n(a._,o._));a.parent.A=l(a,o,a.parent.A||s[0])}function f(a){a._.x=a.z+a.parent.m,a.m+=a.parent.m}function l(a,h,s){if(h){for(var o=a,p=a,d=h,g=o.parent.children[0],v=o.m,y=p.m,x=d.m,w=g.m,$;d=H(d),o=G(o),d&&o;)g=G(g),p=H(p),p.a=a,$=d.z+x-o.z-v+n(d._,o._),$>0&&(rr(er(d,a,s),a,$),v+=$,y+=$),x+=d.m,v+=o.m,w+=g.m,y+=p.m;d&&!H(p)&&(p.t=d,p.m+=x-y),o&&!G(g)&&(g.t=o,g.m+=v-w,s=a)}return s}function c(a){a.x*=r,a.y=a.depth*t}return u.separation=function(a){return arguments.length?(n=a,u):n},u.size=function(a){return arguments.length?(e=!1,r=+a[0],t=+a[1],u):e?null:[r,t]},u.nodeSize=function(a){return arguments.length?(e=!0,r=+a[0],t=+a[1],u):e?[r,t]:null},u}function O(n,r,t,e,u){for(var i=n.children,f,l=-1,c=i.length,a=n.value&&(u-t)/n.value;++l<c;)f=i[l],f.x0=r,f.x1=e,f.y0=t,f.y1=t+=f.value*a}var cn=(1+Math.sqrt(5))/2;function hn(n,r,t,e,u,i){for(var f=[],l=r.children,c,a,h=0,s=0,o=l.length,p,d,g=r.value,v,y,x,w,$,m,B;h<o;){p=u-t,d=i-e;do v=l[s++].value;while(!v&&s<o);for(y=x=v,m=Math.max(d/p,p/d)/(g*n),B=v*v*m,$=Math.max(x/B,B/y);s<o;++s){if(v+=a=l[s].value,a<y&&(y=a),a>x&&(x=a),B=v*v*m,w=Math.max(x/B,B/y),w>$){v-=a;break}$=w}f.push(c={value:v,dice:p<d,children:l.slice(h,s)}),c.dice?I(c,t,e,u,g?e+=d*v/g:i):O(c,t,e,g?t+=p*v/g:u,i),g-=v,h=s}return f}var ln=function n(r){function t(e,u,i,f,l){hn(r,e,u,i,f,l)}return t.ratio=function(e){return n((e=+e)>1?e:1)},t}(cn);function or(){var n=ln,r=!1,t=1,e=1,u=[0],i=E,f=E,l=E,c=E,a=E;function h(o){return o.x0=o.y0=0,o.x1=t,o.y1=e,o.eachBefore(s),u=[0],r&&o.eachBefore(on),o}function s(o){var p=u[o.depth],d=o.x0+p,g=o.y0+p,v=o.x1-p,y=o.y1-p;v<d&&(d=v=(d+v)/2),y<g&&(g=y=(g+y)/2),o.x0=d,o.y0=g,o.x1=v,o.y1=y,o.children&&(p=u[o.depth+1]=i(o)/2,d+=a(o)-p,g+=f(o)-p,v-=l(o)-p,y-=c(o)-p,v<d&&(d=v=(d+v)/2),y<g&&(g=y=(g+y)/2),n(o,d,g,v,y))}return h.round=function(o){return arguments.length?(r=!!o,h):r},h.size=function(o){return arguments.length?(t=+o[0],e=+o[1],h):[t,e]},h.tile=function(o){return arguments.length?(n=U(o),h):n},h.padding=function(o){return arguments.length?h.paddingInner(o).paddingOuter(o):h.paddingInner()},h.paddingInner=function(o){return arguments.length?(i=typeof o=="function"?o:q(+o),h):i},h.paddingOuter=function(o){return arguments.length?h.paddingTop(o).paddingRight(o).paddingBottom(o).paddingLeft(o):h.paddingTop()},h.paddingTop=function(o){return arguments.length?(f=typeof o=="function"?o:q(+o),h):f},h.paddingRight=function(o){return arguments.length?(l=typeof o=="function"?o:q(+o),h):l},h.paddingBottom=function(o){return arguments.length?(c=typeof o=="function"?o:q(+o),h):c},h.paddingLeft=function(o){return arguments.length?(a=typeof o=="function"?o:q(+o),h):a},h}function ar(n,r,t,e,u){var i=n.children,f,l=i.length,c,a=new Array(l+1);for(a[0]=c=f=0;f<l;++f)a[f+1]=c+=i[f].value;h(0,l,n.value,r,t,e,u);function h(s,o,p,d,g,v,y){if(s>=o-1){var x=i[s];x.x0=d,x.y0=g,x.x1=v,x.y1=y;return}for(var w=a[s],$=p/2+w,m=s+1,B=o-1;m<B;){var M=m+B>>>1;a[M]<$?m=M+1:B=M}$-a[m-1]<a[m]-$&&s+1<m&&--m;var _=a[m]-w,A=p-_;if(v-d>y-g){var S=p?(d*A+v*_)/p:v;h(s,m,_,d,g,S,y),h(m,o,A,S,g,v,y)}else{var z=p?(g*A+y*_)/p:y;h(s,m,_,d,g,v,z),h(m,o,A,d,z,v,y)}}}function fr(n,r,t,e,u){(n.depth&1?O:I)(n,r,t,e,u)}var cr=function n(r){function t(e,u,i,f,l){if((c=e._squarify)&&c.ratio===r)for(var c,a,h,s,o=-1,p,d=c.length,g=e.value;++o<d;){for(a=c[o],h=a.children,s=a.value=0,p=h.length;s<p;++s)a.value+=h[s].value;a.dice?I(a,u,i,f,g?i+=(l-i)*a.value/g:l):O(a,u,i,g?u+=(f-u)*a.value/g:f,l),g-=a.value}else e._squarify=c=hn(r,e,u,i,f,l),c.ratio=r}return t.ratio=function(e){return n((e=+e)>1?e:1)},t}(cn);export{k as Node,mn as cluster,C as hierarchy,Jn as pack,Ln as packEnclose,Gn as packSiblings,Qn as partition,Zn as stratify,ir as tree,or as treemap,ar as treemapBinary,I as treemapDice,cr as treemapResquarify,O as treemapSlice,fr as treemapSliceDice,ln as treemapSquarify};
