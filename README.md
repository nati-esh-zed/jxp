# JSCss
active class expansion using Javascript

## sample code

```JS
JSCss.observe();

JSCss.set({
    'theme-dark': 'bg-dark text-light',
    'theme-light': 'bg-light text-dark',
    'theme-slate': 'bg-slate text-light',
    'theme': '@theme-light',
    'panel': '@theme my-2 p-4 border shadow-sm rounded rounded-md',
});
```
