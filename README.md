# JSCss
active class expansion using Javascript

## sample code

```JS
JSCss.observe();

JSCss.set({
    'theme-dark': 'bg-dark text-light',
    'theme-light': 'bg-light text-dark',
    'theme': '@theme-light',
    'panel': '@theme my-2 p-4 border shadow-sm rounded rounded-md',
});
```

```html
<div class="jscss(panel)">
    <h3>hello world!</h3>
</div>
```

is processed to become:

```html
<div class="bg-light text-dark my-2 p-4 border shadow-sm rounded rounded-md">
    <h3>hello world!</h3>
</div>
```
