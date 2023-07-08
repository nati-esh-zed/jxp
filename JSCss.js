
/**
 * JSCss v1.0.0
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

    static _update_element(element)
    {
        let pop_classes = new Map();
        for(let j = 0; j < element.classList.length; j++)
        {
            let class_ = element.classList[j];
            if(class_ != 'jscss' && JSCss.is_set(class_))
            {
                let pop_classes_ = JSCss.get(class_);
                pop_classes.set(class_, pop_classes_);
            }
        }
        for(let [pop_key, pop_classes_] of pop_classes)
        {
            element.classList.remove(pop_key);
            let exp_classes_ = JSCss._expand_refs(pop_classes_);
            if(exp_classes_)
            {
                for(let class_ of exp_classes_)
                {
                    element.classList.add(class_);
                }
            }
        }
        element.classList.remove('jscss');
    }

    static update()
    {
        let all_elements = document.querySelectorAll('.jscss');
        for(let element of all_elements) 
        {
            JSCss._update_element(element)
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
                if(mutation.target.classList.contains('jscss'))
                {
                    JSCss._update_element(mutation.target);
                }
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
    'panel': '@theme my-2 p-4 border shadow-sm rounded rounded-md',
});

 */