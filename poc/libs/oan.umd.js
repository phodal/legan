(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.oan = {})));
}(this, (function (exports) { 'use strict';

  var App = {};
  //# sourceMappingURL=app.js.map

  var Dep = /** @class */ (function () {
      function Dep() {
          this.deps = [];
      }
      Dep.prototype.addDep = function (watcher) {
          if (watcher) {
              this.deps.push(watcher);
          }
      };
      Dep.prototype.notify = function () {
          this.deps.forEach(function (watcher) {
              watcher.update();
          });
      };
      return Dep;
  }());
  //# sourceMappingURL=Dep.js.map

  var Watcher = /** @class */ (function () {
      function Watcher(vm, node, name, nodeType) {
          Dep.target = this;
          this.name = name;
          this.node = node;
          this.vm = vm;
          this.nodeType = nodeType;
          this.update();
          Dep.target = null;
      }
      Watcher.prototype.get = function () {
          this.value = this.vm[this.name];
      };
      Watcher.prototype.update = function () {
          this.get();
          if (this.nodeType === 'text') {
              this.node.nodeValue = this.value;
          }
          if (this.nodeType === 'input') {
              this.node.value = this.value;
          }
          if (this.nodeType === 'p') {
              this.node.innerHTML = this.value;
          }
      };
      return Watcher;
  }());
  //# sourceMappingURL=Watcher.js.map

  function Observe(obj, vm) {
      Object.keys(obj).forEach(function (key) {
          defineReactive(vm, key, obj[key]);
      });
  }
  function defineReactive(obj, key, val) {
      var dep = new Dep();
      Object.defineProperty(obj, key, {
          get: function () {
              if (Dep.target) {
                  dep.addDep(Dep.target);
              }
              return val;
          },
          set: function (newVal) {
              if (newVal === val)
                  return;
              val = newVal;
              dep.notify();
          }
      });
  }
  //# sourceMappingURL=Observe.js.map

  var DiliComponent = function (component) {
      function DiliElement() {
          var construct = Reflect.construct(HTMLElement, [], DiliElement);
          construct.constructor(component);
          return construct;
      }
      DiliElement.prototype = Object.create(HTMLElement.prototype, {
          constructor: {
              value: function constructor() {
                  this.component = component;
                  if (typeof this.component.ready === 'function') {
                      this.component.ready();
                  }
                  return DiliElement;
              }
          },
          createBinding: {
              value: function createBinding(childNodes) {
                  var _this = this;
                  childNodes.forEach(function (node) {
                      var reg = /{{(.*)}}/;
                      var that = _this;
                      var nodeName = node.nodeName.toLowerCase();
                      if (nodeName === 'input') {
                          if (node.attributes && node.attributes.length > 0) {
                              var mapName = void 0;
                              var _loop_1 = function (i) {
                                  var attr = node.attributes[i];
                                  if (attr.name === '[model]') {
                                      var name_1 = (mapName = attr.nodeValue);
                                      node.addEventListener('input', function (e) {
                                          that.component[name_1] = e.target.value;
                                      });
                                      node.value = that.component.data[name_1];
                                      node.removeAttribute('[model]');
                                  }
                              };
                              for (var i = 0; i < node.attributes.length; i++) {
                                  _loop_1(i);
                              }
                              var watcher = new Watcher(that.component, node, mapName, 'input');
                          }
                      }
                      if (node.nodeType === node.TEXT_NODE) {
                          if (reg.test(node.nodeValue)) {
                              var name_2 = RegExp.$1;
                              name_2 = name_2.trim();
                              var watcher = new Watcher(that.component, node, name_2, 'text');
                          }
                      }
                      if (nodeName === 'p') {
                          if (reg.test(node.innerHTML)) {
                              var name_3 = RegExp.$1;
                              name_3 = name_3.trim();
                              var watcher = new Watcher(that.component, node, name_3, 'p');
                          }
                      }
                  });
              }
          },
          bindData: {
              value: function () {
                  var data = this.component.data;
                  if (data) {
                      Observe(data, this.component);
                  }
                  var thatDoc = document;
                  var thisDoc = (thatDoc._currentScript || thatDoc.currentScript).ownerDocument;
                  var querySelector = thisDoc.querySelector('template');
                  if (querySelector) {
                      this.createBinding(querySelector.content.childNodes);
                      this.appendChild(querySelector.content);
                  }
              }
          },
          getAttrData: {
              value: function getAttrData() {
                  var attrToRemove = [];
                  if (this.attributes && this.attributes.length > 0) {
                      for (var i = 0; i < this.attributes.length; i++) {
                          var attribute = this.attributes[i];
                          if (/\[(\w+)\]/.test(attribute.name)) {
                              var name_4 = RegExp.$1;
                              console.log(name_4);
                              if (name_4 === 'draggable') {
                                  this.setAttribute(name_4, true);
                              }
                              else {
                                  this.component.data[name_4] = attribute.value;
                              }
                              attrToRemove.push(attribute.name);
                          }
                      }
                      for (var _i = 0, attrToRemove_1 = attrToRemove; _i < attrToRemove_1.length; _i++) {
                          var remove = attrToRemove_1[_i];
                          this.removeAttribute(remove);
                      }
                  }
              }
          },
          getBindEvents: {
              value: function getAttrData() {
                  var eventMap = [];
                  if (this.attributes && this.attributes.length > 0) {
                      for (var i = 0; i < this.attributes.length; i++) {
                          var attribute = this.attributes[i];
                          if (/\((\w+)\)/.test(attribute.name)) {
                              var name_5 = RegExp.$1;
                              eventMap.push({
                                  event: name_5,
                                  method: attribute.value.replace(/\(\)/, '')
                              });
                          }
                      }
                  }
                  return eventMap;
              }
          },
          connectedCallback: {
              value: function connectedCallback() {
                  var eventMap = this.getBindEvents();
                  this.addEvents(this, eventMap);
                  this.getAttrData();
                  this.bindData();
                  this.component.connected && this.component.connected();
              }
          },
          attributeChangedCallback: {
              value: function attributeChangedCallback() {
                  console.log('attributeChangedCallback');
                  this.component.change && this.component.change();
              }
          },
          disconnectedCallback: {
              value: function disconnectedCallback() {
                  console.log('disconnectedCallback');
                  this.component.disconnected && this.component.disconnected();
              }
          },
          adoptedCallback: {
              value: function adoptedCallback() {
                  console.log('adoptedCallback');
                  this.component.adopted && this.component.adopted();
              }
          },
          addEvents: {
              value: function (node, eventMap) {
                  for (var i = 0; i < eventMap.length; i++) {
                      var event_1 = eventMap[i];
                      this.addEvent(node, event_1);
                  }
              }
          },
          addEvent: {
              value: function (node, event) {
                  node.addEventListener(event.event, this.component.methods[event.method]);
              }
          },
          fireEvent: {
              value: function () {
                  return;
              }
          },
          removeEvent: {
              value: function () {
                  return;
              }
          },
          removeEvents: {
              value: function () {
                  return;
              }
          }
      });
      return customElements.define("" + component.is, DiliElement);
  };

  var components = [];
  function Component(component) {
      var diliComponent = DiliComponent(component);
      components.push({
          is: component.is,
          component: diliComponent
      });
      App.components = components;
  }
  //# sourceMappingURL=oan.js.map

  exports.App = App;
  exports.Component = Component;
  exports.DiliComponent = DiliComponent;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
