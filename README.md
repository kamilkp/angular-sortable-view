angular-sortable-view v0.0.2
=================

Fully declarative (multi)sortable for AngularJS

Demo: http://kamilkp.github.io/angular-sortable-view/

You can find the source code for this demo on branch "gh-pages".

###DESCRIPTION:

This is a simple library written as a module for [AngularJS](https://github.com/angular/angular.js) for sorting elements in the UI. It supports both single elements list, and multiple connected lists, where an element can be moved from one to another.

This library requires ***no dependencies whatsoever*** (except angular.js of course), so ***you no longer need to include jQuery and jQueryUI and angularUI*** which altogether gives the size of around ***340kB minified***. Whereas the [angular-sortable-view](https://github.com/kamilkp/angular-sortable-view) is only ***5kB minified!***.

###API:

The API is declarative. There are four directives (hooked on attributes) that need to be nested properly:

  * `sv-root` - this is where all the logic is happening. If multiple lists should be connected with each other so that elements can be moved between them and they have a common ancestor, put this attribute on that element. If not and you still want the multi-sortable behaviour a value for that attribue must be provided. That value will be used as an identifier to connect those roots together.
  * `sv-part` - this attribute should be placed on an element that is a container for the `ngRepeat`'ed elements. Its value should be the same as the right hand side expression in `ng-repeat` attribute.
  * `sv-element` - this attribute should be placed on the same element as `ng-repeat` attribute. Its (optional) value should be an expression that evaluates to the options object.
  * `sv-handle` - this attribute is optional. If needed it can be placed on an element within the sortable element. This element will be the handle for sorting operations.
  * `sv-helper` - the element with this attribute will serve as a custom helper for sorting operations

###Example of single sortable list

```html
<div sv-root sv-part="modelArray">
	<div ng-repeat="item in modelArray" sv-element>
		<div>{{item}}</div>
	</div>
</div>
```

###Example of multiple sortable lists with common ancestor

```html
<div sv-root>
	<div sv-part="modelArray1">
		<div ng-repeat="item in modelArray1" sv-element>
			<div>{{item}}</div>
		</div>
	</div>
	<div sv-part="modelArray2">
		<div ng-repeat="item in modelArray2" sv-element>
			<div>{{item}}</div>
		</div>
	</div>
</div>
```

###Example of multiple sortable lists without common ancestor

```html
<div>
	<div sv-root="someUniqueId" sv-part="modelArray1">
		<div ng-repeat="item in modelArray1" sv-element>
			<div>{{item}}</div>
		</div>
	</div>
	<div sv-root="someUniqueId" sv-part="modelArray2">
		<div ng-repeat="item in modelArray2" sv-element>
			<div>{{item}}</div>
		</div>
	</div>
</div>
```

###Example of using handles

```html
<div sv-root sv-part="modelArray">
	<div ng-repeat="item in modelArray" sv-element>
		<div>{{item}}</div>
		<span sv-handle></span>
	</div>
</div>
```

###Example of using custom helpers per part

```html
<div sv-root sv-part="modelArray">
	<div sv-helper>
		custom helper
	</div>
	<div ng-repeat="item in modelArray" sv-element>
		{{item}}
	</div>
</div>
```

###Example of using custom helpers per element

```html
<div sv-root sv-part="modelArray">
	<div ng-repeat="item in modelArray" sv-element>
		<div sv-helper>
			custom helper {{item}}
		</div>
		{{item}}
	</div>
</div>
```