(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{312:function(t,e,s){"use strict";s.r(e);class i{constructor(t,e,s){this.text=t,this.config=Object({typeDelay:200,deleteDelay:70,delDelimiters:"()"},e),this.cb=s,this.texts=[],this.textsIndex=0,this.letterIndex=1,this.typedText="",this.parse(),this.typeText()}parse(){const{text:t,config:e}=this,{delDelimiters:s}=e,i=/[-.*+?^${}()|[\]\/\\]/g,n=s[0].replace(i,"\\$&"),l=s[1].replace(i,"\\$&"),h=new RegExp(`(${n}(?:.|\\n)+?${l})`,"g");this.texts=t.split(h).map(t=>({msg:t,delete:!!t.match(h)})).filter(t=>""!==t.msg)}typeText(){const{texts:t,textsIndex:e,config:s}=this,{typeDelay:i}=s,n=t[e].msg;let l=this.typedText+n.slice(0,this.letterIndex++);if("<"===l.slice(-1)&&"<br/>"===n.slice(0,this.letterIndex+3).slice(-5)&&(l=this.typedText+n.slice(0,this.letterIndex+3),this.letterIndex+=3),this.cb(l),this.letterIndex>n.length){if(t[e].delete)return setTimeout(()=>{this.deleteText()},500),void(this.letterIndex=n.length);if(this.letterIndex=1,this.typedText+=n,this.textsIndex++,this.textsIndex>=t.length)return}setTimeout(()=>{this.typeText()},i)}deleteText(){const{texts:t,textsIndex:e,config:s}=this,{deleteDelay:i}=s,n=t[e].msg;this.cb(this.typedText+n.slice(0,this.letterIndex---1)),0===this.letterIndex?(this.textsIndex++,this.typeText()):setTimeout(()=>{this.deleteText()},i)}}var n={data:()=>({introduction:""}),mounted(){new i("嗨，很高兴认识你～\n    <br />\n    我叫阿平，前端工程师，喜欢踢球，人称“(进攻终结者)拼命三郎防守哥”，我的位置是边后卫。\n    <br />\n    今天愉快～\n    ".replace(/(\n|\s+)/g,""),{},t=>{this.introduction=t})}},l=s(4),h=Object(l.a)(n,(function(){return(0,this._self._c)("p",{domProps:{innerHTML:this._s(this.introduction)}})}),[],!1,null,null,null);e.default=h.exports}}]);