  
(function ($, window, undefined) {
var
dataFlag = "watermark",
dataClass = "watermarkClass",
dataFocus = "watermarkFocus",
dataFormSubmit = "watermarkSubmit",
dataMaxLen = "watermarkMaxLength",
dataPassword = "watermarkPassword",
dataText = "watermarkText",
rreturn = /\r/g,
selWatermarkDefined = "input:data(" + dataFlag + "),textarea:data(" + dataFlag + ")",
selWatermarkAble = "input:text,input:password,input[type=search],input:not([type]),textarea",
triggerFns = [
"Page_ClientValidate"
],
pageDirty = false,
hasNativePlaceholder = ("placeholder" in document.createElement("input"));
$.watermark = $.watermark || {
version: "3.1.3",
runOnce: true,
options: {
className: "watermark",
useNative: true,
hideBeforeUnload: true
},
hide: function (selector) {
$(selector).filter(selWatermarkDefined).each(
function () {
$.watermark._hide($(this));
}
);
},
_hide: function ($input, focus) {
var elem = $input[0],
inputVal = (elem.value || "").replace(rreturn, ""),
inputWm = $input.data(dataText) || "",
maxLen = $input.data(dataMaxLen) || 0,
className = $input.data(dataClass);
if ((inputWm.length) && (inputVal == inputWm)) {
elem.value = "";
if ($input.data(dataPassword)) {
if (($input.attr("type") || "") === "text") {
var $pwd = $input.data(dataPassword) || [],
$wrap = $input.parent() || [];
if (($pwd.length) && ($wrap.length)) {
$wrap[0].removeChild($input[0]);
$wrap[0].appendChild($pwd[0]);
$input = $pwd;
}
}
}
if (maxLen) {
$input.attr("maxLength", maxLen);
$input.removeData(dataMaxLen);
}
if (focus) {
$input.attr("autocomplete", "off");
window.setTimeout(
function () {
$input.select();
}
, 1);
}
}
className && $input.removeClass(className);
},
show: function (selector) {
$(selector).filter(selWatermarkDefined).each(
function () {
$.watermark._show($(this));
}
);
},
_show: function ($input) {
var elem = $input[0],
val = (elem.value || "").replace(rreturn, ""),
text = $input.data(dataText) || "",
type = $input.attr("type") || "",
className = $input.data(dataClass);
if (((val.length == 0) || (val == text)) && (!$input.data(dataFocus))) {
pageDirty = true;
if ($input.data(dataPassword)) {
if (type === "password") {
var $pwd = $input.data(dataPassword) || [],
$wrap = $input.parent() || [];
if (($pwd.length) && ($wrap.length)) {
$wrap[0].removeChild($input[0]);
$wrap[0].appendChild($pwd[0]);
$input = $pwd;
$input.attr("maxLength", text.length);
elem = $input[0];
}
}
}
if ((type === "text") || (type === "search")) {
var maxLen = $input.attr("maxLength") || 0;
if ((maxLen > 0) && (text.length > maxLen)) {
$input.data(dataMaxLen, maxLen);
$input.attr("maxLength", text.length);
}
}
className && $input.addClass(className);
elem.value = text;
}
else {
$.watermark._hide($input);
}
},
hideAll: function () {
if (pageDirty) {
$.watermark.hide(selWatermarkAble);
pageDirty = false;
}
},
showAll: function () {
$.watermark.show(selWatermarkAble);
}
};
$.fn.watermark = $.fn.watermark || function (text, options) {
if (!this.length) {
return this;
}
var hasClass = false,
hasText = (typeof(text) === "string");
if (hasText) {
text = text.replace(rreturn, "");
}
if (typeof(options) === "object") {
hasClass = (typeof(options.className) === "string");
options = $.extend({}, $.watermark.options, options);
}
else if (typeof(options) === "string") {
hasClass = true;
options = $.extend({}, $.watermark.options, {className: options});
}
else {
options = $.watermark.options;
}
if (typeof(options.useNative) !== "function") {
options.useNative = options.useNative? function () { return true; } : function () { return false; };
}
return this.each(
function () {
var $input = $(this);
if (!$input.is(selWatermarkAble)) {
return;
}
if ($input.data(dataFlag)) {
if (hasText || hasClass) {
$.watermark._hide($input);
if (hasText) {
$input.data(dataText, text);
}
if (hasClass) {
$input.data(dataClass, options.className);
}
}
}
else {
if (
(hasNativePlaceholder)
&& (options.useNative.call(this, $input))
&& (($input.attr("tagName") || "") !== "TEXTAREA")
) {
if (hasText) {
$input.attr("placeholder", text);
}
return;
}
$input.data(dataText, hasText? text : "");
$input.data(dataClass, options.className);
$input.data(dataFlag, 1);
if (($input.attr("type") || "") === "password") {
var $wrap = $input.wrap("<span>").parent(),
$wm = $($wrap.html().replace(/type=["']?password["']?/i, 'type="text"'));
$wm.data(dataText, $input.data(dataText));
$wm.data(dataClass, $input.data(dataClass));
$wm.data(dataFlag, 1);
$wm.attr("maxLength", text.length);
$wm.focus(
function () {
$.watermark._hide($wm, true);
}
).bind("dragenter",
function () {
$.watermark._hide($wm);
}
).bind("dragend",
function () {
window.setTimeout(function () { $wm.blur(); }, 1);
}
);
$input.blur(
function () {
$.watermark._show($input);
}
).bind("dragleave",
function () {
$.watermark._show($input);
}
);
$wm.data(dataPassword, $input);
$input.data(dataPassword, $wm);
}
else {
$input.focus(
function () {
$input.data(dataFocus, 1);
$.watermark._hide($input, true);
}
).blur(
function () {
$input.data(dataFocus, 0);
$.watermark._show($input);
}
).bind("dragenter",
function () {
$.watermark._hide($input);
}
).bind("dragleave",
function () {
$.watermark._show($input);
}
).bind("dragend",
function () {
window.setTimeout(function () { $.watermark._show($input); }, 1);
}
).bind("drop",
function (evt) {
var elem = $input[0],
dropText = evt.originalEvent.dataTransfer.getData("Text");
if ((elem.value || "").replace(rreturn, "").replace(dropText, "") === $input.data(dataText)) {
elem.value = dropText;
}
$input.focus();
}
);
}
if (this.form) {
var form = this.form,
$form = $(form);
if (!$form.data(dataFormSubmit)) {
$form.submit($.watermark.hideAll);
if (form.submit) {
$form.data(dataFormSubmit, form.submit);
form.submit = (function (f, $f) {
return function () {
var nativeSubmit = $f.data(dataFormSubmit);
$.watermark.hideAll();
if (nativeSubmit.apply) {
nativeSubmit.apply(f, Array.prototype.slice.call(arguments));
}
else {
nativeSubmit();
}
};
})(form, $form);
}
else {
$form.data(dataFormSubmit, 1);
form.submit = (function (f) {
return function () {
$.watermark.hideAll();
delete f.submit;
f.submit();
};
})(form);
}
}
}
}
$.watermark._show($input);
}
);
};
if ($.watermark.runOnce) {
$.watermark.runOnce = false;
$.extend($.expr[":"], {
data: function( elem, i, match ) {
return !!$.data( elem, match[ 3 ] );
}
});
(function (valOld) {
$.fn.val = function () {
if ( !this.length ) {
return arguments.length? this : undefined;
}
if ( !arguments.length ) {
if ( this.data(dataFlag) ) {
var v = (this[0].value || "").replace(rreturn, "");
return (v === (this.data(dataText) || ""))? "" : v;
}
else {
return valOld.apply( this, arguments );
}
}
else {
valOld.apply( this, arguments );
$.watermark.show(this);
return this;
}
};
})($.fn.val);
if (triggerFns.length) {
$(function () {
var i, name, fn;
for (i=triggerFns.length-1; i>=0; i--) {
name = triggerFns[i];
fn = window[name];
if (typeof(fn) === "function") {
window[name] = (function (origFn) {
return function () {
$.watermark.hideAll();
return origFn.apply(null, Array.prototype.slice.call(arguments));
};
})(fn);
}
}
});
}
$(window).bind("beforeunload", function () {
if ($.watermark.options.hideBeforeUnload) {
$.watermark.hideAll();
}
});
}
})(jQuery, window);
