---
title: 以一个🌰梳理Vue 更新流程
meta:
  - name: keywords
    content: vue 源码分析 响应式原理 发布订阅
summary: 以一个例子对Vue 初始化到更新的整体流程进行梳理，摸清Vue 响应式原理，Vue 事件的触发原理
date: 2020-03-23
tags:
  - Vue
---

#### 前言

Vue 如日中天，几乎每一个Web 开发者都知道Vue 是通过**Object.defineProperty** 对数据劫持以达到响应式处理，通过发布订阅模式进行事件处理，通过key 确保元素状态复用...

---

针对这些知识点，通过一个例子进行梳理。俗话说，“光练不说傻把式”，那么进行一次自我检阅。

（以下内容结合[vue v2.6.11](https://github.com/vuejs/vue/tree/v2.6.11)阅读）

```html
<div id="app">
  <div>
    <input type="text" v-model="name" />
    <my-button text="添加" @click="add" />
  </div>
  <ul>
    <li v-for="(item, i) in showList" :key="i">
      <input type="checkbox"> {{ item.name }}
    </li>
  </ul>
</div>

<script>
const app = new Vue({
  el: '#app',
  components: {
    MyButton: {
      template: `<button @click="$emit('click')">{{ text }}</button>`,
      props: {
        text: String,
      },
    },
  },
  data: {
    name: '',
    newId: 3,
    list: [
      Object.freeze({ id: 1, name: '李斯' }),
      Object.freeze({ id: 2, name: '吕不韦' }),
      Object.freeze({ id: 3, name: '嬴政' }),
    ],
  },

  computed: {
    showList() {
      return this.list.filter(v => v.id <= 5);
    },
  },

  methods: {
    add() {
      if (!this.name) return;

      this.list.unshift(Object.freeze({ id: ++this.newId, name: this.name }));
      this.name = '';
    }
  }
});
</script>
```

#### 初始化

Vue 在初始化阶段做了挺多事情，配置合并，初始化生命周期相关信息，初始化事件中心，初始化data，初始化props，初始化computed，初始化watcher。本文只分析例子涉及的关键点。

##### 初始化data

初始化data 的调用栈```new Observer(value)```←`observe`←`initData`

数据监听的调用栈`defineReactive(obj, keys[i])`←`walk(value)`←`new Observer(value)`

在`defineReactive`内还会对值进行观测`observe(obj[key])`

递归下来，就能深度监听data对象。

本文只分析value 是data.list的过程。

由于**Object.defineProperty** 不能够监听数组下标，所以Vue 是通过hack，重写所有能改变数组自身的方法，比如push，pop，先执行原逻辑函数，如果是往数组新增元素，则把新增元素变成响应式。

再遍历data.list的元素，执行`new Observer(value)`，此时value 为数组元素，遍历元素属性，执行`defineReactive(obj, keys[i])`为每一个元素的属性添加getter setter，例子中的元素被Object.freeze()处理，不会对子元素处理。

##### 初始化computed

遍历computed 对象，对每一个computed 属性实例化watcher，其实computed 就是computed watcher。

```javascript
// https://github.com/vuejs/vue/blob/v2.6.11/src/core/instance/state.js#L187
new Watcher(
  vm,
  getter || noop,
  noop,
  computedWatcherOptions // { lazy: true }
)
```

重新定义computed 的getter

```javascript
// https://github.com/vuejs/vue/blob/v2.6.11/src/core/instance/state.js#L241
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```

#### 渲染

Vue 有Runtime only 版本和Runtime + complier版本。

对于基于webpack 的工程，只需要Runtime，通过vue-loader 和vue-template-compiler 将template 预编译为渲染函数，避免运行时编译开销。

编译调用栈`generate`←`createFunction`←`compileToFunctions`←`$mount`

```javascript
// options.render = render
function() {
	with(this){return _c('div',{attrs:{"id":"app"}},[_c('div',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(name),expression:"name"}],attrs:{"type":"text"},domProps:{"value":(name)},on:{"input":function($event){if($event.target.composing)return;name=$event.target.value}}}),_v(" "),_c('my-button',{attrs:{"text":"添加"},on:{"click":add}})],1),_v(" "),_c('ul',_l((showList),function(item,i){return _c('li',{key:i},[_c('input',{attrs:{"type":"checkbox"}}),_v(" "+_s(item.name)+"\n        ")])}),0)])}
}
```

首次渲染调用栈`createElm`←`patch`←`vm.__patch__`←`vm._update`←`mountComponent`←`vm.$mount`

```javascript
// https://github.com/vuejs/vue/blob/v2.6.11/src/core/instance/lifecycle.js#L197
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}

new Watcher(vm, updateComponent, noop, {
  before () {
    if (vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'beforeUpdate')
    }
  }
}, true /* isRenderWatcher */)
```

实例化一个渲染watcher，在`get`内执行watcher getter 也就是updateComponent。

关键的一个点，执行`pushTarget(this)`，将渲染watcher 储存到全局Dep.target。

```javascript
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}
```

执行`vm._render()`，递归生成VNode Tree。

```javascript
// https://github.com/vuejs/vue/blob/v2.6.11/src/core/instance/render.js#L91
vnode = render.call(vm._renderProxy, vm.$createElement)
```

render 就是经过编译得到的匿名函数，执行函数，此时获取data属性，触发属性的getter，此数据就收集了订阅者渲染watcher，这个过程也就是依赖收集。

当渲染模版读取computed 时，触发getter，执行回调，此时`watcher.dirty`为`true`，执行`watcher.evaluate()`，先执行`pushTarget(this)`，这时全局Dep.target 指向computed watcher。又触发了data.list 的getter，此时data.list 的收集器就能收集到computed watcher，且computed watcher 的deps也保存有 data.list 的依赖收集器 dep。

```javascript
// data.list.getter() ← computedWatcher.get() ← computedWatcher.evaluate()
targetStack = [renderWatcher, computendWatcher]
Dep.target = computedWatcher

dataListDep = { subs: [computed watcher] }
computedWatcher = { deps: [dataListDep] }

// popTarget
targetStack = [renderWatcher]
Dep.target = renderWatcher

computedWatcher.dirty = false
```

接着执行`watcher.depend()`，data.list 的收集器就能收集到渲染watcher。

```
// dep.addSub() ← Dep.target.addDep() ← dep.depend() ← watcher.depend()
// 遍历computedWatcher = { deps: [dataListDep] }
// 执行dataListDep.depend()
// 执行Dep.target.addDep(this)
// 执行dataListDep.addSub(this)
dataListDep = { subs: [computedWatcher, renderWatcher] }
```

执行`vm._update`，递归遍历`createElm`，通过先子后父的插入顺序将Vnode 渲染成DOM。

如果是组件，会走`createComponent`

创建组件调用栈`updateComponent`←`Vue.$mount`←`Vue._init`←`new Vue.extend(options)`←`createComponentInstanceForVnode`←`init`←`createComponent`

又回到渲染调用栈。最后挂载到#app的父节点即body上，再移除旧节点。

##### 事件绑定

`patch`是`createPatchFunction`柯里化返回的函数，通过柯里化抹平平台差异，无须没次调用传入参数。

除此之外，还将元素的钩子函数聚合在一起。元素事件，属性，样式的设置更新都是通过这些钩子完成。

本文跳过v-model 的实现，重点在click。

###### 自定义事件

在构造组件VNode的时候，会把新建一个参数listeners，指向data.on，并作为options 属性，去实例化VNode。

在组件渲染成dom进行组件初始化的时候，调用初始化事件中心，将自定义事件传递给子组件实例，存储在`vm._events`。

```javascript
// createComponent ← createElement() ← vm._render()
listeners = data.on = { "click": this.add }
componentVnode.componentOptions.listeners = { "click": this.add }

//  updateListeners() ... ← initEvent() ← Vue._init() ← ... ← createComponent ← ... ← vm._update()
// createComponentInstanceForVnode
new vnode.componentOptions.Ctor({ ..., _parentVnode: vnode })
// initInternalComponent
vm.$options._parentListeners = options._parentVnode.componentOptions.listeners
// initEvents
updateComponentListeners(vm, listeners)
// ...
vm.$on('click', this.add)
// ...
vm._events['click'] = [this.add]
```

###### dom 事件绑定

在`patch`过程触发元素的钩子函数`create`，进行事件的绑定。

在dom 插入父节点前会执行`invokeCreateHooks`。

```javascript
// updateListeners ← updateDOMListeners ← invokeCreateHooks(vnode, insertedVnodeQueue)
vnode.elm.addEventListener('click', this.$emit('click'));
```

#### 更新

现在分析，勾选李斯，输入框输入张三，点击button，这个更新过程。

涉及v-model，简单介绍一下。实际上v-model是一个语法糖，一个指令，在编译过程，针对不同标签生成不同事件和属性，通过composing 细节处理混合输入法的抬手问题。例如`<input type="radio" />`生成change 事件和 checked 属性，`<input type="text" />`生成 input 事件和 value 属性。 这就是Vue的双向绑定原理。

当点击button，触发click 回调，通过`MyButton.$emit('click')`派发事件，执行`MyButton._event['click']`存储的所有函数。这时定义在父组件的`add`被触发，执行`this.list.unshift`，触发Vue 子定义的方法，执行`dataList.__ob__.dep.notify()`，触发订阅者更新。

```javascript
[computedWatcher, renderWatcher].forEach(sub => sub.update)
// computedWatcher.update()
computedWatcher.dirty = true

// renderWatcher.update()
queueWatcher(renderWatcher)

function queueWatcher(watcher) {
  if (has[id] == null) {
    ...
    queue.push(watcher)
  }
}
// 这里涉及更新队列优化，比如，在这个例子中
// this.list.unshift 会触发renderWatcher.update
// this.name = '' 也会触发renderWatcher.update
// 同一个renderWatcher，所以只会添加一次
queue = [renderWatcher]

nextTick(flushSchedulerQueue);
// 使用nextTick，更新队列将在下一个Tick执行
// 下一个Tick就是当主线程为空，从任务队列读取任务到调用栈中等待主线程执行。

// patchVnode() ← vm.__patch__() ← ... ← vm._update(vm._render(), hydrating)
// ← updateComponent()(renderWatcher.getter()) ← renderWatcher.run()
// ← flushSchedulerQueue()

// 在执行vm.render()的时候，触发computed 的getter，重新计算返回新值
// 这个过程又会触发dataList 的getter，进行新一路的依赖收集，流程还是一样
// 所以说computed 是惰性的（缓存的），只有真正去获取值的时候才会执行计算
```

Vue 的`patchVnode`逻辑通过判断节点类型进行更新：

1. 新节点为非文本节点
   1. 新旧节点都有children && 两者不相等，updateChildren
   2. 只有新节点有children，旧节点为文本先清空，再新增children
   3. 只有旧节点有children，移除旧节点children
   4. 旧节点只有文本节点，清空文本内容
2. 新节点为文本节点 && 与旧节点不相等，则用文本替换旧节点内容

通过递归的方式完成整棵VNode 树的更新。

以updateCHildren 为主线，分析key 的作用。

当对ul 新旧VNode 进行比对时，去到updateChildren 分支，通过伪代码的形式分析。

```javascript
VNode: [{ tag: 'li', key: 0, children: [{ tag: 'input', elm: { value: 'on' } }, { text: '李斯' }]}, ...]
newVNode: [{ tag: 'li', key: 0, children: [{ tag: 'input': elm: undefined }, { text: '张三' }]}, ...]

// 当对新旧liVnode 比对时，判断key tag 相等，patchVnode(inputVNode, newInputVNode)
// 当对新旧inputVnode 比对时，判断key tag inputType 相等，patchVnode，复用节点，造成错误渲染
var elm = vnode.elm = oldVnode.elm;

// 把模版li 标签的id 更换为item.id
VNode: [{ tag: 'li', key: 1, children: [{ tag: 'input', elm: { value: 'on' } }, { text: '李斯' }]}, ...]
newVNode: [{ tag: 'li', key: 4, children: [{ tag: 'input': elm: undefined }, { text: '张三' }]}, { tag: 'li', key: 1, children: [{ tag: 'input', elm: { value: 'on' } }, { text: '李斯' }]}, ...]
// 简化一下
VNode: [a, b, c]
newVNode: [d, a, b, c]
oldStartIdx = 0
newStartIdx = 0
oldEndIdx = 2
newEndIdx = 3
oldStartVnode = a
oldEndVnode = c
newStartVnode = d
newEndVnode = c

while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  // 进行首首对比same(a, d)不符合，进行尾尾对比same(c, c)，复用节点
  oldEndIdx = 1
  oldEndVnode = b
  newEndIdx = 2
  newEndVnode = b
  // 进行首首对比same(a, d)不符合，进行尾尾对比same(b, b)，复用节点
  oldEndIdx = 0
  oldEndVnode = a
  newEndIdx = 1
  newEndVnode = a
  // 进行首首对比same(a, d)不符合，进行尾尾对比same(a, a)，复用节点
  oldEndIdx = -1
  oldEndVnode = undefined
  newEndIdx = 0
  newEndVnode = d
}
newStartIdx = 0
newEndIdx = 0
addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
// 满足条件，创建新元素并插入
createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
```

#### 总结

此次梳理只是针对例子，整体流程走了一遍，很多细节上的内容并没有展开，感兴趣可以针对某一模块进行单步调试加深理解。

通过以上流程可以梳理出几个知识点：

1. computed 实际上是一个computedWatcher，作为data 和 渲染Watcher 的桥梁，使得渲染Watcher 能够间接订阅data。
2. key 作为VNode 的唯一标识，确保元素可以复用自身状态，避免发生错误渲染，涉及依赖状态的都必须使用静态key。除非渲染一些简单类型的内容，刻意利用Vue 内部的算法以达到性能的提升。另外的，在一些复杂的列表场景，不能命中首尾交叉比对的情况下，Vue 会根据oldChildren 的key生成key-index 的对象，可以根据newStartVnode 的key 找到与之对应的 oldVNode，相对遍历oldChildren 再比对，性能较优。
3. 原生事件是通过addEventListener 注册，自定义事件由父组件传递给子组件实例储存，通过发布订阅的模式实现。
