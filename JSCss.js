
/**
 * JSCss v1.1.3
 * 
 * Replaces registered classes actively using mutation observers. 
 * 
 * JSCss.update()
 * JSCss.update_on_load()
 * JSCss.observe()
 * JSCss.set(key_class, classes)
 * JSCss.get(key_class)
 * JSCss.has(key_class)
 * 
 */

class JSCss
{
    static _class_map = new Map();

    static _expand_refs(classes)
    {
        let expanded_classes_ = Array();
        for(let class_ of classes)
        {
            if(class_.charAt(0) == '@')
            {
                let ref_key     = class_.substr(1);
                let ref_classes = JSCss.get(ref_key);
                if(ref_classes)
                {
                    for(let ref_class of ref_classes)
                    {
                        expanded_classes_.push(ref_class);
                    }
                }
                else
                {
                    expanded_classes_.push(class_);
                } 
            }
            else
            {
                expanded_classes_.push(class_);
            }
        }
        return expanded_classes_;
    }

    static _update_element_paren(element)
    {
        for(let class_i of element.classList)
        {
            if(class_i.startsWith('jscss(') && class_i.endsWith(')'))
            {
                let jscss_params  = class_i.substr(6, class_i.length - 7);
                let jscss_classes = jscss_params.split(',');
                for(let jscss_class of jscss_classes)
                {
                    if(JSCss.is_set(jscss_class))
                    {
                        let classes_     = JSCss.get(jscss_class);
                        let exp_classes  = JSCss._expand_refs(classes_);
                        for(let exp_class of exp_classes)
                            element.classList.add(exp_class);
                    }
                }
                element.classList.remove(class_i);
            }
        }
    }

    static update()
    {
        let all_elements = document.querySelectorAll('*');
        for(let element of all_elements) 
        {
            JSCss._update_element_paren(element)
        }
    };

    static update_on_load()
    {
        document.addEventListener('DOMContentLoaded', JSCss.update);
    }

    static observe()
    {
        const targetNode = document;
        const config = { attributes: true, childList: true, subtree: true };
        const callback = function(mutationList, observer) 
        {
            for(const mutation of mutationList) 
            {
                JSCss._update_element_paren(mutation.target);
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    };

    static set(key_class, classes)
    {
        if(typeof(classes) == 'string')
        {
            let classes_ = classes.split(' ');
            let exp_classes_ = JSCss._expand_refs(classes_);
            jscss_classes[key_class] = exp_classes_;
        }
        else if(classes instanceof Array)
        {
            let exp_classes_ = JSCss._expand_refs(classes);
            this._class_map.set(key_class, exp_classes_);
        }
        else if(key_class instanceof Object)
        {
            let keys = Object.keys(key_class);
            for(let i = 0; i < keys.length; i++)
            {
                let key = keys[i];
                let classes_ = key_class[key].split(' ');
                let exp_classes_ = JSCss._expand_refs(classes_);
                this._class_map.set(key, exp_classes_);
            }
        }
    }

    static get(key_class)
    {
        return this._class_map.get(key_class);
    }

    static is_set(key_class)
    {
        return this._class_map.has(key_class);
    }

};

/*

JSCss.observe();

JSCss.set({
    'theme-dark': 'bg-dark text-light',
    'theme-light': 'bg-light text-dark',
    'theme-slate': 'bg-slate text-light',
    'theme': '@theme-light',
    'panel': 'my-2 p-4 border shadow-sm rounded rounded-md',
});

<div class="jscss(panel,theme)">
    hello world!
</div>

 */
