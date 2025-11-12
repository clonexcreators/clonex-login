const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/add-DeMoOvyZ.js","assets/chunks/core-eGiovma1.js","assets/vendor/vendor-web3-oAvc8dMH.js","assets/vendor/vendor-react-BvdKT-Sw.js","assets/vendor/vendor-ui-ByS1mJOj.js","assets/vendor/vendor-query-CfVYerzJ.js","assets/chunks/events-B9UvYD6_.js","assets/chunks/index.es-D7L2q2_V.js","assets/chunks/all-wallets-B8vpYZzs.js","assets/chunks/arrow-bottom-circle-DosnM15O.js","assets/app/app-store-C9AvfRnV.js","assets/chunks/apple-BtgKJ4tY.js","assets/chunks/arrow-bottom-DVYVaI0W.js","assets/chunks/arrow-left-BIIhQvsR.js","assets/chunks/arrow-right-C6w4ygYu.js","assets/chunks/arrow-top-CAHfYopr.js","assets/chunks/bank-C4w7UoaJ.js","assets/chunks/browser-D1W-dcO9.js","assets/chunks/card-BFdRFp5i.js","assets/chunks/checkmark-CXf-p-rZ.js","assets/chunks/checkmark-bold-CN_pdqZJ.js","assets/chunks/chevron-bottom-CkraC7cp.js","assets/chunks/chevron-left-CNNpBtNi.js","assets/chunks/chevron-right-BAjBxWfq.js","assets/chunks/chevron-top-2J6M3SBn.js","assets/chunks/chrome-store-UKddO_Zl.js","assets/chunks/clock-BGk8C_kZ.js","assets/chunks/close-BeRTdV2e.js","assets/chunks/compass-CHNFyqhH.js","assets/chunks/coinPlaceholder-bcKhLTrV.js","assets/chunks/copy-Dbcpvg33.js","assets/chunks/cursor-DE8dPbo-.js","assets/chunks/cursor-transparent-BN7HSxvP.js","assets/chunks/desktop-DcaMfRWd.js","assets/chunks/disconnect-D3vyj31_.js","assets/chunks/discord-DinQkt9u.js","assets/chunks/etherscan-u8ZJ3nwl.js","assets/chunks/extension-gCoKw0jx.js","assets/chunks/external-link-Bh1CiFmC.js","assets/chunks/facebook-GlLWj6ME.js","assets/chunks/farcaster-Orpo2Lhx.js","assets/chunks/filters-bHZfTfqF.js","assets/chunks/github-BzcZ9SdS.js","assets/chunks/google-D0Edle5V.js","assets/chunks/help-circle-BLtm7pjS.js","assets/chunks/image-CRVMg-ng.js","assets/chunks/id-CN-TJjUN.js","assets/chunks/info-circle-CYW98xA-.js","assets/chunks/lightbulb-BtOMPCWz.js","assets/chunks/mail-BL4fypMk.js","assets/chunks/mobile-CfxVlFLX.js","assets/chunks/more-C-B88g5Q.js","assets/chunks/network-placeholder-RwxBg24n.js","assets/chunks/nftPlaceholder-l58ZhZnn.js","assets/chunks/off-oUW_38c8.js","assets/chunks/play-store-CPKYWd3m.js","assets/chunks/plus-CdSAXc0p.js","assets/chunks/qr-code-C77MY_wu.js","assets/chunks/recycle-horizontal-Cx0sJ2jY.js","assets/chunks/refresh-DG27e7fM.js","assets/chunks/search-n8Rtn_3n.js","assets/chunks/send-C3NGr7au.js","assets/chunks/swapHorizontal-DyyIuhpI.js","assets/chunks/swapHorizontalMedium-wDLqOKGs.js","assets/chunks/swapHorizontalBold-3zZyjzhI.js","assets/chunks/swapHorizontalRoundedBold-DXVF8-O7.js","assets/chunks/swapVertical-D2qOVhY4.js","assets/chunks/telegram-M-r2cjqi.js","assets/chunks/three-dots-1vhB0GsO.js","assets/chunks/twitch-ZSQl6E2m.js","assets/chunks/x-lxO9FOYG.js","assets/chunks/twitterIcon-9Wdz-Q0T.js","assets/chunks/verify-D3l13X-3.js","assets/chunks/verify-filled-C8_OgbYb.js","assets/chunks/wallet-C1BHwaLl.js","assets/chunks/walletconnect-NzTfj589.js","assets/chunks/wallet-placeholder-7iIsSnMl.js","assets/chunks/warning-circle-fkqTt9Bl.js","assets/chunks/info-sS3lLDtc.js","assets/chunks/exclamation-triangle-Cc2uEOEY.js","assets/chunks/reown-logo-DM2EOVcQ.js"])))=>i.map(i=>d[i]);
import{J as t,K as e,k as r,l as o,m as a,x as i,L as n,N as s,o as c,n as l}from"./core-eGiovma1.js";import{_ as g}from"../vendor/vendor-web3-oAvc8dMH.js";const h={getSpacingStyles:(t,e)=>Array.isArray(t)?t[e]?`var(--wui-spacing-${t[e]})`:void 0:"string"==typeof t?`var(--wui-spacing-${t})`:void 0,getFormattedDate:t=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t),getHostName(t){try{return new URL(t).hostname}catch(e){return""}},getTruncateString:({string:t,charsStart:e,charsEnd:r,truncate:o})=>t.length<=e+r?t:"end"===o?`${t.substring(0,e)}...`:"start"===o?`...${t.substring(t.length-r)}`:`${t.substring(0,Math.floor(e))}...${t.substring(t.length-Math.floor(r))}`,generateAvatarColors(t){const e=t.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),r=this.hexToRgb(e),o=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),a=100-3*Number(o?.replace("px","")),i=`${a}% ${a}% at 65% 40%`,n=[];for(let s=0;s<5;s+=1){const t=this.tintColor(r,.15*s);n.push(`rgb(${t[0]}, ${t[1]}, ${t[2]})`)}return`\n    --local-color-1: ${n[0]};\n    --local-color-2: ${n[1]};\n    --local-color-3: ${n[2]};\n    --local-color-4: ${n[3]};\n    --local-color-5: ${n[4]};\n    --local-radial-circle: ${i}\n   `},hexToRgb(t){const e=parseInt(t,16);return[e>>16&255,e>>8&255,255&e]},tintColor(t,e){const[r,o,a]=t;return[Math.round(r+(255-r)*e),Math.round(o+(255-o)*e),Math.round(a+(255-a)*e)]},isNumber:t=>/^[0-9]+$/u.test(t),getColorTheme:t=>t||("undefined"!=typeof window&&window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)")?.matches?"dark":"light":"dark"),splitBalance(t){const e=t.split(".");return 2===e.length?[e[0],e[1]]:["0","00"]},roundNumber:(t,e,r)=>t.toString().length>=e?Number(t).toFixed(r):t,formatNumberToLocalString:(t,e=2)=>void 0===t?"0.00":"number"==typeof t?t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e}):parseFloat(t).toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e})};function p(t){return function(e){return"function"==typeof e?function(t,e){return customElements.get(t)||customElements.define(t,e),e}(t,e):function(t,e){const{kind:r,elements:o}=e;return{kind:r,elements:o,finisher(e){customElements.get(t)||customElements.define(t,e)}}}(t,e)}}const w={attribute:!0,type:String,converter:e,reflect:!1,hasChanged:t},u=(t=w,e,r)=>{const{kind:o,metadata:a}=r;let i=globalThis.litPropertyMetadata.get(a);if(void 0===i&&globalThis.litPropertyMetadata.set(a,i=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),i.set(r.name,t),"accessor"===o){const{name:o}=r;return{set(r){const a=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,a,t)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=r;return function(r){const a=this[o];e.call(this,r),this.requestUpdate(o,a,t)}}throw Error("Unsupported decorator location: "+o)};function v(t){return(e,r)=>"object"==typeof r?u(t,e,r):((t,e,r)=>{const o=e.hasOwnProperty(r);return e.constructor.createProperty(r,t),o?Object.getOwnPropertyDescriptor(e,r):void 0})(t,e,r)}function d(t){return v({...t,state:!0,attribute:!1})}const _=r`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var f=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};let y=class extends a{render(){return this.style.cssText=`\n      flex-direction: ${this.flexDirection};\n      flex-wrap: ${this.flexWrap};\n      flex-basis: ${this.flexBasis};\n      flex-grow: ${this.flexGrow};\n      flex-shrink: ${this.flexShrink};\n      align-items: ${this.alignItems};\n      justify-content: ${this.justifyContent};\n      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};\n      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};\n      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};\n      padding-top: ${this.padding&&h.getSpacingStyles(this.padding,0)};\n      padding-right: ${this.padding&&h.getSpacingStyles(this.padding,1)};\n      padding-bottom: ${this.padding&&h.getSpacingStyles(this.padding,2)};\n      padding-left: ${this.padding&&h.getSpacingStyles(this.padding,3)};\n      margin-top: ${this.margin&&h.getSpacingStyles(this.margin,0)};\n      margin-right: ${this.margin&&h.getSpacingStyles(this.margin,1)};\n      margin-bottom: ${this.margin&&h.getSpacingStyles(this.margin,2)};\n      margin-left: ${this.margin&&h.getSpacingStyles(this.margin,3)};\n    `,i`<slot></slot>`}};y.styles=[o,_],f([v()],y.prototype,"flexDirection",void 0),f([v()],y.prototype,"flexWrap",void 0),f([v()],y.prototype,"flexBasis",void 0),f([v()],y.prototype,"flexGrow",void 0),f([v()],y.prototype,"flexShrink",void 0),f([v()],y.prototype,"alignItems",void 0),f([v()],y.prototype,"justifyContent",void 0),f([v()],y.prototype,"columnGap",void 0),f([v()],y.prototype,"rowGap",void 0),f([v()],y.prototype,"gap",void 0),f([v()],y.prototype,"padding",void 0),f([v()],y.prototype,"margin",void 0),y=f([p("wui-flex")],y);const m=t=>t??n,S=t=>(...e)=>({_$litDirective$:t,values:e});let b=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,r){this._$Ct=t,this._$AM=e,this._$Ci=r}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const E=(t,e)=>{const r=t._$AN;if(void 0===r)return!1;for(const o of r)o._$AO?.(e,!1),E(o,e);return!0},$=t=>{let e,r;do{if(void 0===(e=t._$AM))break;r=e._$AN,r.delete(t),t=e}while(0===r?.size)},x=t=>{for(let e;e=t._$AM;t=e){let r=e._$AN;if(void 0===r)e._$AN=r=new Set;else if(r.has(t))break;r.add(t),j(e)}};function P(t){void 0!==this._$AN?($(this),this._$AM=t,x(this)):this._$AM=t}function R(t,e=!1,r=0){const o=this._$AH,a=this._$AN;if(void 0!==a&&0!==a.size)if(e)if(Array.isArray(o))for(let i=r;i<o.length;i++)E(o[i],!1),$(o[i]);else null!=o&&(E(o,!1),$(o));else E(this,t)}const j=t=>{2==t.type&&(t._$AP??(t._$AP=R),t._$AQ??(t._$AQ=P))};class A extends b{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,r){super._$AT(t,e,r),x(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(E(this,t),$(this))}setValue(t){if(void 0===this._$Ct.strings)this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}class k{constructor(t){this.G=t}disconnect(){this.G=void 0}reconnect(t){this.G=t}deref(){return this.G}}class T{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(t=>this.Z=t))}resume(){this.Z?.(),this.Y=this.Z=void 0}}const O=t=>{return!(null===(e=t)||"object"!=typeof e&&"function"!=typeof e||"function"!=typeof t.then);var e},L=1073741823,D=S(class extends A{constructor(){super(...arguments),this._$Cwt=L,this._$Cbt=[],this._$CK=new k(this),this._$CX=new T}render(...t){return t.find(t=>!O(t))??s}update(t,e){const r=this._$Cbt;let o=r.length;this._$Cbt=e;const a=this._$CK,i=this._$CX;this.isConnected||this.disconnected();for(let n=0;n<e.length&&!(n>this._$Cwt);n++){const t=e[n];if(!O(t))return this._$Cwt=n,t;n<o&&t===r[n]||(this._$Cwt=L,o=0,Promise.resolve(t).then(async e=>{for(;i.get();)await i.get();const r=a.deref();if(void 0!==r){const o=r._$Cbt.indexOf(t);o>-1&&o<r._$Cwt&&(r._$Cwt=o,r.setValue(e))}}))}return s}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}),z=new class{constructor(){this.cache=new Map}set(t,e){this.cache.set(t,e)}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}delete(t){this.cache.delete(t)}clear(){this.cache.clear()}},I=r`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var C=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};const V={add:async()=>(await g(async()=>{const{addSvg:t}=await import("./add-DeMoOvyZ.js");return{addSvg:t}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).addSvg,allWallets:async()=>(await g(async()=>{const{allWalletsSvg:t}=await import("./all-wallets-B8vpYZzs.js");return{allWalletsSvg:t}},__vite__mapDeps([8,1,2,3,4,5,6,7]))).allWalletsSvg,arrowBottomCircle:async()=>(await g(async()=>{const{arrowBottomCircleSvg:t}=await import("./arrow-bottom-circle-DosnM15O.js");return{arrowBottomCircleSvg:t}},__vite__mapDeps([9,1,2,3,4,5,6,7]))).arrowBottomCircleSvg,appStore:async()=>(await g(async()=>{const{appStoreSvg:t}=await import("../app/app-store-C9AvfRnV.js");return{appStoreSvg:t}},__vite__mapDeps([10,1,2,3,4,5,6,7]))).appStoreSvg,apple:async()=>(await g(async()=>{const{appleSvg:t}=await import("./apple-BtgKJ4tY.js");return{appleSvg:t}},__vite__mapDeps([11,1,2,3,4,5,6,7]))).appleSvg,arrowBottom:async()=>(await g(async()=>{const{arrowBottomSvg:t}=await import("./arrow-bottom-DVYVaI0W.js");return{arrowBottomSvg:t}},__vite__mapDeps([12,1,2,3,4,5,6,7]))).arrowBottomSvg,arrowLeft:async()=>(await g(async()=>{const{arrowLeftSvg:t}=await import("./arrow-left-BIIhQvsR.js");return{arrowLeftSvg:t}},__vite__mapDeps([13,1,2,3,4,5,6,7]))).arrowLeftSvg,arrowRight:async()=>(await g(async()=>{const{arrowRightSvg:t}=await import("./arrow-right-C6w4ygYu.js");return{arrowRightSvg:t}},__vite__mapDeps([14,1,2,3,4,5,6,7]))).arrowRightSvg,arrowTop:async()=>(await g(async()=>{const{arrowTopSvg:t}=await import("./arrow-top-CAHfYopr.js");return{arrowTopSvg:t}},__vite__mapDeps([15,1,2,3,4,5,6,7]))).arrowTopSvg,bank:async()=>(await g(async()=>{const{bankSvg:t}=await import("./bank-C4w7UoaJ.js");return{bankSvg:t}},__vite__mapDeps([16,1,2,3,4,5,6,7]))).bankSvg,browser:async()=>(await g(async()=>{const{browserSvg:t}=await import("./browser-D1W-dcO9.js");return{browserSvg:t}},__vite__mapDeps([17,1,2,3,4,5,6,7]))).browserSvg,card:async()=>(await g(async()=>{const{cardSvg:t}=await import("./card-BFdRFp5i.js");return{cardSvg:t}},__vite__mapDeps([18,1,2,3,4,5,6,7]))).cardSvg,checkmark:async()=>(await g(async()=>{const{checkmarkSvg:t}=await import("./checkmark-CXf-p-rZ.js");return{checkmarkSvg:t}},__vite__mapDeps([19,1,2,3,4,5,6,7]))).checkmarkSvg,checkmarkBold:async()=>(await g(async()=>{const{checkmarkBoldSvg:t}=await import("./checkmark-bold-CN_pdqZJ.js");return{checkmarkBoldSvg:t}},__vite__mapDeps([20,1,2,3,4,5,6,7]))).checkmarkBoldSvg,chevronBottom:async()=>(await g(async()=>{const{chevronBottomSvg:t}=await import("./chevron-bottom-CkraC7cp.js");return{chevronBottomSvg:t}},__vite__mapDeps([21,1,2,3,4,5,6,7]))).chevronBottomSvg,chevronLeft:async()=>(await g(async()=>{const{chevronLeftSvg:t}=await import("./chevron-left-CNNpBtNi.js");return{chevronLeftSvg:t}},__vite__mapDeps([22,1,2,3,4,5,6,7]))).chevronLeftSvg,chevronRight:async()=>(await g(async()=>{const{chevronRightSvg:t}=await import("./chevron-right-BAjBxWfq.js");return{chevronRightSvg:t}},__vite__mapDeps([23,1,2,3,4,5,6,7]))).chevronRightSvg,chevronTop:async()=>(await g(async()=>{const{chevronTopSvg:t}=await import("./chevron-top-2J6M3SBn.js");return{chevronTopSvg:t}},__vite__mapDeps([24,1,2,3,4,5,6,7]))).chevronTopSvg,chromeStore:async()=>(await g(async()=>{const{chromeStoreSvg:t}=await import("./chrome-store-UKddO_Zl.js");return{chromeStoreSvg:t}},__vite__mapDeps([25,1,2,3,4,5,6,7]))).chromeStoreSvg,clock:async()=>(await g(async()=>{const{clockSvg:t}=await import("./clock-BGk8C_kZ.js");return{clockSvg:t}},__vite__mapDeps([26,1,2,3,4,5,6,7]))).clockSvg,close:async()=>(await g(async()=>{const{closeSvg:t}=await import("./close-BeRTdV2e.js");return{closeSvg:t}},__vite__mapDeps([27,1,2,3,4,5,6,7]))).closeSvg,compass:async()=>(await g(async()=>{const{compassSvg:t}=await import("./compass-CHNFyqhH.js");return{compassSvg:t}},__vite__mapDeps([28,1,2,3,4,5,6,7]))).compassSvg,coinPlaceholder:async()=>(await g(async()=>{const{coinPlaceholderSvg:t}=await import("./coinPlaceholder-bcKhLTrV.js");return{coinPlaceholderSvg:t}},__vite__mapDeps([29,1,2,3,4,5,6,7]))).coinPlaceholderSvg,copy:async()=>(await g(async()=>{const{copySvg:t}=await import("./copy-Dbcpvg33.js");return{copySvg:t}},__vite__mapDeps([30,1,2,3,4,5,6,7]))).copySvg,cursor:async()=>(await g(async()=>{const{cursorSvg:t}=await import("./cursor-DE8dPbo-.js");return{cursorSvg:t}},__vite__mapDeps([31,1,2,3,4,5,6,7]))).cursorSvg,cursorTransparent:async()=>(await g(async()=>{const{cursorTransparentSvg:t}=await import("./cursor-transparent-BN7HSxvP.js");return{cursorTransparentSvg:t}},__vite__mapDeps([32,1,2,3,4,5,6,7]))).cursorTransparentSvg,desktop:async()=>(await g(async()=>{const{desktopSvg:t}=await import("./desktop-DcaMfRWd.js");return{desktopSvg:t}},__vite__mapDeps([33,1,2,3,4,5,6,7]))).desktopSvg,disconnect:async()=>(await g(async()=>{const{disconnectSvg:t}=await import("./disconnect-D3vyj31_.js");return{disconnectSvg:t}},__vite__mapDeps([34,1,2,3,4,5,6,7]))).disconnectSvg,discord:async()=>(await g(async()=>{const{discordSvg:t}=await import("./discord-DinQkt9u.js");return{discordSvg:t}},__vite__mapDeps([35,1,2,3,4,5,6,7]))).discordSvg,etherscan:async()=>(await g(async()=>{const{etherscanSvg:t}=await import("./etherscan-u8ZJ3nwl.js");return{etherscanSvg:t}},__vite__mapDeps([36,1,2,3,4,5,6,7]))).etherscanSvg,extension:async()=>(await g(async()=>{const{extensionSvg:t}=await import("./extension-gCoKw0jx.js");return{extensionSvg:t}},__vite__mapDeps([37,1,2,3,4,5,6,7]))).extensionSvg,externalLink:async()=>(await g(async()=>{const{externalLinkSvg:t}=await import("./external-link-Bh1CiFmC.js");return{externalLinkSvg:t}},__vite__mapDeps([38,1,2,3,4,5,6,7]))).externalLinkSvg,facebook:async()=>(await g(async()=>{const{facebookSvg:t}=await import("./facebook-GlLWj6ME.js");return{facebookSvg:t}},__vite__mapDeps([39,1,2,3,4,5,6,7]))).facebookSvg,farcaster:async()=>(await g(async()=>{const{farcasterSvg:t}=await import("./farcaster-Orpo2Lhx.js");return{farcasterSvg:t}},__vite__mapDeps([40,1,2,3,4,5,6,7]))).farcasterSvg,filters:async()=>(await g(async()=>{const{filtersSvg:t}=await import("./filters-bHZfTfqF.js");return{filtersSvg:t}},__vite__mapDeps([41,1,2,3,4,5,6,7]))).filtersSvg,github:async()=>(await g(async()=>{const{githubSvg:t}=await import("./github-BzcZ9SdS.js");return{githubSvg:t}},__vite__mapDeps([42,1,2,3,4,5,6,7]))).githubSvg,google:async()=>(await g(async()=>{const{googleSvg:t}=await import("./google-D0Edle5V.js");return{googleSvg:t}},__vite__mapDeps([43,1,2,3,4,5,6,7]))).googleSvg,helpCircle:async()=>(await g(async()=>{const{helpCircleSvg:t}=await import("./help-circle-BLtm7pjS.js");return{helpCircleSvg:t}},__vite__mapDeps([44,1,2,3,4,5,6,7]))).helpCircleSvg,image:async()=>(await g(async()=>{const{imageSvg:t}=await import("./image-CRVMg-ng.js");return{imageSvg:t}},__vite__mapDeps([45,1,2,3,4,5,6,7]))).imageSvg,id:async()=>(await g(async()=>{const{idSvg:t}=await import("./id-CN-TJjUN.js");return{idSvg:t}},__vite__mapDeps([46,1,2,3,4,5,6,7]))).idSvg,infoCircle:async()=>(await g(async()=>{const{infoCircleSvg:t}=await import("./info-circle-CYW98xA-.js");return{infoCircleSvg:t}},__vite__mapDeps([47,1,2,3,4,5,6,7]))).infoCircleSvg,lightbulb:async()=>(await g(async()=>{const{lightbulbSvg:t}=await import("./lightbulb-BtOMPCWz.js");return{lightbulbSvg:t}},__vite__mapDeps([48,1,2,3,4,5,6,7]))).lightbulbSvg,mail:async()=>(await g(async()=>{const{mailSvg:t}=await import("./mail-BL4fypMk.js");return{mailSvg:t}},__vite__mapDeps([49,1,2,3,4,5,6,7]))).mailSvg,mobile:async()=>(await g(async()=>{const{mobileSvg:t}=await import("./mobile-CfxVlFLX.js");return{mobileSvg:t}},__vite__mapDeps([50,1,2,3,4,5,6,7]))).mobileSvg,more:async()=>(await g(async()=>{const{moreSvg:t}=await import("./more-C-B88g5Q.js");return{moreSvg:t}},__vite__mapDeps([51,1,2,3,4,5,6,7]))).moreSvg,networkPlaceholder:async()=>(await g(async()=>{const{networkPlaceholderSvg:t}=await import("./network-placeholder-RwxBg24n.js");return{networkPlaceholderSvg:t}},__vite__mapDeps([52,1,2,3,4,5,6,7]))).networkPlaceholderSvg,nftPlaceholder:async()=>(await g(async()=>{const{nftPlaceholderSvg:t}=await import("./nftPlaceholder-l58ZhZnn.js");return{nftPlaceholderSvg:t}},__vite__mapDeps([53,1,2,3,4,5,6,7]))).nftPlaceholderSvg,off:async()=>(await g(async()=>{const{offSvg:t}=await import("./off-oUW_38c8.js");return{offSvg:t}},__vite__mapDeps([54,1,2,3,4,5,6,7]))).offSvg,playStore:async()=>(await g(async()=>{const{playStoreSvg:t}=await import("./play-store-CPKYWd3m.js");return{playStoreSvg:t}},__vite__mapDeps([55,1,2,3,4,5,6,7]))).playStoreSvg,plus:async()=>(await g(async()=>{const{plusSvg:t}=await import("./plus-CdSAXc0p.js");return{plusSvg:t}},__vite__mapDeps([56,1,2,3,4,5,6,7]))).plusSvg,qrCode:async()=>(await g(async()=>{const{qrCodeIcon:t}=await import("./qr-code-C77MY_wu.js");return{qrCodeIcon:t}},__vite__mapDeps([57,1,2,3,4,5,6,7]))).qrCodeIcon,recycleHorizontal:async()=>(await g(async()=>{const{recycleHorizontalSvg:t}=await import("./recycle-horizontal-Cx0sJ2jY.js");return{recycleHorizontalSvg:t}},__vite__mapDeps([58,1,2,3,4,5,6,7]))).recycleHorizontalSvg,refresh:async()=>(await g(async()=>{const{refreshSvg:t}=await import("./refresh-DG27e7fM.js");return{refreshSvg:t}},__vite__mapDeps([59,1,2,3,4,5,6,7]))).refreshSvg,search:async()=>(await g(async()=>{const{searchSvg:t}=await import("./search-n8Rtn_3n.js");return{searchSvg:t}},__vite__mapDeps([60,1,2,3,4,5,6,7]))).searchSvg,send:async()=>(await g(async()=>{const{sendSvg:t}=await import("./send-C3NGr7au.js");return{sendSvg:t}},__vite__mapDeps([61,1,2,3,4,5,6,7]))).sendSvg,swapHorizontal:async()=>(await g(async()=>{const{swapHorizontalSvg:t}=await import("./swapHorizontal-DyyIuhpI.js");return{swapHorizontalSvg:t}},__vite__mapDeps([62,1,2,3,4,5,6,7]))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await g(async()=>{const{swapHorizontalMediumSvg:t}=await import("./swapHorizontalMedium-wDLqOKGs.js");return{swapHorizontalMediumSvg:t}},__vite__mapDeps([63,1,2,3,4,5,6,7]))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await g(async()=>{const{swapHorizontalBoldSvg:t}=await import("./swapHorizontalBold-3zZyjzhI.js");return{swapHorizontalBoldSvg:t}},__vite__mapDeps([64,1,2,3,4,5,6,7]))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await g(async()=>{const{swapHorizontalRoundedBoldSvg:t}=await import("./swapHorizontalRoundedBold-DXVF8-O7.js");return{swapHorizontalRoundedBoldSvg:t}},__vite__mapDeps([65,1,2,3,4,5,6,7]))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await g(async()=>{const{swapVerticalSvg:t}=await import("./swapVertical-D2qOVhY4.js");return{swapVerticalSvg:t}},__vite__mapDeps([66,1,2,3,4,5,6,7]))).swapVerticalSvg,telegram:async()=>(await g(async()=>{const{telegramSvg:t}=await import("./telegram-M-r2cjqi.js");return{telegramSvg:t}},__vite__mapDeps([67,1,2,3,4,5,6,7]))).telegramSvg,threeDots:async()=>(await g(async()=>{const{threeDotsSvg:t}=await import("./three-dots-1vhB0GsO.js");return{threeDotsSvg:t}},__vite__mapDeps([68,1,2,3,4,5,6,7]))).threeDotsSvg,twitch:async()=>(await g(async()=>{const{twitchSvg:t}=await import("./twitch-ZSQl6E2m.js");return{twitchSvg:t}},__vite__mapDeps([69,1,2,3,4,5,6,7]))).twitchSvg,twitter:async()=>(await g(async()=>{const{xSvg:t}=await import("./x-lxO9FOYG.js");return{xSvg:t}},__vite__mapDeps([70,1,2,3,4,5,6,7]))).xSvg,twitterIcon:async()=>(await g(async()=>{const{twitterIconSvg:t}=await import("./twitterIcon-9Wdz-Q0T.js");return{twitterIconSvg:t}},__vite__mapDeps([71,1,2,3,4,5,6,7]))).twitterIconSvg,verify:async()=>(await g(async()=>{const{verifySvg:t}=await import("./verify-D3l13X-3.js");return{verifySvg:t}},__vite__mapDeps([72,1,2,3,4,5,6,7]))).verifySvg,verifyFilled:async()=>(await g(async()=>{const{verifyFilledSvg:t}=await import("./verify-filled-C8_OgbYb.js");return{verifyFilledSvg:t}},__vite__mapDeps([73,1,2,3,4,5,6,7]))).verifyFilledSvg,wallet:async()=>(await g(async()=>{const{walletSvg:t}=await import("./wallet-C1BHwaLl.js");return{walletSvg:t}},__vite__mapDeps([74,1,2,3,4,5,6,7]))).walletSvg,walletConnect:async()=>(await g(async()=>{const{walletConnectSvg:t}=await import("./walletconnect-NzTfj589.js");return{walletConnectSvg:t}},__vite__mapDeps([75,1,2,3,4,5,6,7]))).walletConnectSvg,walletConnectLightBrown:async()=>(await g(async()=>{const{walletConnectLightBrownSvg:t}=await import("./walletconnect-NzTfj589.js");return{walletConnectLightBrownSvg:t}},__vite__mapDeps([75,1,2,3,4,5,6,7]))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await g(async()=>{const{walletConnectBrownSvg:t}=await import("./walletconnect-NzTfj589.js");return{walletConnectBrownSvg:t}},__vite__mapDeps([75,1,2,3,4,5,6,7]))).walletConnectBrownSvg,walletPlaceholder:async()=>(await g(async()=>{const{walletPlaceholderSvg:t}=await import("./wallet-placeholder-7iIsSnMl.js");return{walletPlaceholderSvg:t}},__vite__mapDeps([76,1,2,3,4,5,6,7]))).walletPlaceholderSvg,warningCircle:async()=>(await g(async()=>{const{warningCircleSvg:t}=await import("./warning-circle-fkqTt9Bl.js");return{warningCircleSvg:t}},__vite__mapDeps([77,1,2,3,4,5,6,7]))).warningCircleSvg,x:async()=>(await g(async()=>{const{xSvg:t}=await import("./x-lxO9FOYG.js");return{xSvg:t}},__vite__mapDeps([70,1,2,3,4,5,6,7]))).xSvg,info:async()=>(await g(async()=>{const{infoSvg:t}=await import("./info-sS3lLDtc.js");return{infoSvg:t}},__vite__mapDeps([78,1,2,3,4,5,6,7]))).infoSvg,exclamationTriangle:async()=>(await g(async()=>{const{exclamationTriangleSvg:t}=await import("./exclamation-triangle-Cc2uEOEY.js");return{exclamationTriangleSvg:t}},__vite__mapDeps([79,1,2,3,4,5,6,7]))).exclamationTriangleSvg,reown:async()=>(await g(async()=>{const{reownSvg:t}=await import("./reown-logo-DM2EOVcQ.js");return{reownSvg:t}},__vite__mapDeps([80,1,2,3,4,5,6,7]))).reownSvg};let B=class extends a{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`\n      --local-color: var(--wui-color-${this.color});\n      --local-width: var(--wui-icon-size-${this.size});\n      --local-aspect-ratio: ${this.aspectRatio}\n    `,i`${D(async function(t){if(z.has(t))return z.get(t);const e=(V[t]??V.copy)();return z.set(t,e),e}(this.name),i`<div class="fallback"></div>`)}`}};B.styles=[o,c,I],C([v()],B.prototype,"size",void 0),C([v()],B.prototype,"name",void 0),C([v()],B.prototype,"color",void 0),C([v()],B.prototype,"aspectRatio",void 0),B=C([p("wui-icon")],B);const H=S(class extends b{constructor(t){if(super(t),1!==t.type||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const r=t.element.classList;for(const o of this.st)o in e||(r.remove(o),this.st.delete(o));for(const o in e){const t=!!e[o];t===this.st.has(o)||this.nt?.has(o)||(t?(r.add(o),this.st.add(o)):(r.remove(o),this.st.delete(o)))}return s}}),M=r`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var N=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};let F=class extends a{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const t={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`\n      --local-align: ${this.align};\n      --local-color: var(--wui-color-${this.color});\n    `,i`<slot class=${H(t)}></slot>`}};F.styles=[o,M],N([v()],F.prototype,"variant",void 0),N([v()],F.prototype,"color",void 0),N([v()],F.prototype,"align",void 0),N([v()],F.prototype,"lineClamp",void 0),F=N([p("wui-text")],F);const G=r`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var U=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};let q=class extends a{constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){const t=this.iconSize||this.size,e="lg"===this.size,r="xl"===this.size,o=e?"12%":"16%",a=e?"xxs":r?"s":"3xl",n="gray"===this.background,s="opaque"===this.background,c="accent-100"===this.backgroundColor&&s||"success-100"===this.backgroundColor&&s||"error-100"===this.backgroundColor&&s||"inverse-100"===this.backgroundColor&&s;let l=`var(--wui-color-${this.backgroundColor})`;return c?l=`var(--wui-icon-box-bg-${this.backgroundColor})`:n&&(l=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`\n       --local-bg-value: ${l};\n       --local-bg-mix: ${c||n?"100%":o};\n       --local-border-radius: var(--wui-border-radius-${a});\n       --local-size: var(--wui-icon-box-size-${this.size});\n       --local-border: ${"wui-color-bg-125"===this.borderColor?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}\n   `,i` <wui-icon color=${this.iconColor} size=${t} name=${this.icon}></wui-icon> `}};q.styles=[o,l,G],U([v()],q.prototype,"size",void 0),U([v()],q.prototype,"backgroundColor",void 0),U([v()],q.prototype,"iconColor",void 0),U([v()],q.prototype,"iconSize",void 0),U([v()],q.prototype,"background",void 0),U([v({type:Boolean})],q.prototype,"border",void 0),U([v()],q.prototype,"borderColor",void 0),U([v()],q.prototype,"icon",void 0),q=U([p("wui-icon-box")],q);const Y=r`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var W=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};let K=class extends a{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`\n      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};\n      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};\n      `,i`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};K.styles=[o,c,Y],W([v()],K.prototype,"src",void 0),W([v()],K.prototype,"alt",void 0),W([v()],K.prototype,"size",void 0),K=W([p("wui-image")],K);const X=r`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var Z=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};let Q=class extends a{constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;const t="md"===this.size?"mini-700":"micro-700";return i`
      <wui-text data-variant=${this.variant} variant=${t} color="inherit">
        <slot></slot>
      </wui-text>
    `}};Q.styles=[o,X],Z([v()],Q.prototype,"variant",void 0),Z([v()],Q.prototype,"size",void 0),Q=Z([p("wui-tag")],Q);const J=r`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var tt=function(t,e,r,o){var a,i=arguments.length,n=i<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,r):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,r,o);else for(var s=t.length-1;s>=0;s--)(a=t[s])&&(n=(i<3?a(n):i>3?a(e,r,n):a(e,r))||n);return i>3&&n&&Object.defineProperty(e,r,n),n};let et=class extends a{constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText="--local-color: "+("inherit"===this.color?"inherit":`var(--wui-color-${this.color})`),this.dataset.size=this.size,i`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};et.styles=[o,J],tt([v()],et.prototype,"color",void 0),tt([v()],et.prototype,"size",void 0),et=tt([p("wui-loading-spinner")],et);export{h as U,H as a,p as c,S as e,A as f,v as n,m as o,d as r};
