# jxp v1.3.13

active class expansion using mutation observers. #Javascript

## sample code

```JS
let jxp = new Jxp();

jxp.set({
    'theme-dark': 'bg-dark text-light',
    'theme-light': 'bg-light text-dark',
});
jxp.set('theme', '@theme-dark');
jxp.set('panel', 'my-2 p-4 border shadow-sm rounded rounded-md');
jxp.set('panel', ['my-2', 'p-4', 'border', 'shadow-sm', 'rounded', 'rounded-md']); // same as above
jxp.observe();
```

```html
<div class="jxp:panel,theme">
    <h3>hello world!</h3>
</div>
```

is processed to become:

```html
<div class="my-2 p-4 border shadow-sm rounded rounded-md bg-light text-dark">
    <h3>hello world!</h3>
</div>
```
