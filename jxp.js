
/**
 * jxp v1.1.6
 * 
 * Replaces registered classes actively using mutation observers. 
 * 
 * jxp.update()
 * jxp.update_on_load()
 * jxp.observe()
 * jxp.set(key_class, classes)
 * jxp.get(key_class)
 * jxp.has(key_class)
 * 
 */

class jxp
{
    static _class_map = new Map();
    static _observer = null;

    static _expand_refs(classes)
    {
        let expanded_classes_ = Array();
        for(let class_ of classes)
        {
            if(class_.charAt(0) == '@')
            {
                let ref_key     = class_.substr(1);
                let ref_classes = jxp.get(ref_key);
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
        if(element)
        {
            for(let class_i of element.classList)
            {
                const keyword = 'jxp(';
                if(class_i.startsWith('jxp(') && class_i.endsWith(')'))
                {
                    let jxp_params  = class_i.substring(keyword.length, class_i.length - 1);
                    let jxp_classes = jxp_params.split(',');
                    for(let jxp_class of jxp_classes)
                    {
                        if(jxp.is_set(jxp_class))
                        {
                            let classes_     = jxp.get(jxp_class);
                            let exp_classes  = jxp._expand_refs(classes_);
                            for(let exp_class of exp_classes)
                                element.classList.add(exp_class);
                        }
                    }
                    element.classList.remove(class_i);
                }
            }
        }
    }

    static _update_element_recursive(element)
    {
        if(element)
        {
            jxp._update_element(element);
            for(let child of element.children)
            {
                jxp._update_element_recursive(child);
            }
        }
    }

    static update()
    {
        let all_elements = document.querySelectorAll('*');
        for(let element of all_elements) 
        {
            jxp._update_element(element)
        }
    };

    static update_on_load()
    {
        document.addEventListener('DOMContentLoaded', jxp.update);
    }

    static observe()
    {
        if(!jxp._observer)
        {
            const config = { 
                    attributes: true,
                    attributeFilter: ['class'], 
                    childList: true, 
                    subtree: true };
            const callback = function(mutation_list, observer) 
            {
                for(const mutation of mutation_list) 
                {
                    jxp._update_element_recursive(mutation.target);
                }
            };
            jxp.observer = new MutationObserver(callback);
            jxp.observer.observe(document, config);
        }
    };

    static set(key_class, classes)
    {
        if(typeof(classes) == 'string')
        {
            let classes_ = classes.split(' ');
            let exp_classes_ = jxp._expand_refs(classes_);
            jxp_classes[key_class] = exp_classes_;
        }
        else if(classes instanceof Array)
        {
            let exp_classes_ = jxp._expand_refs(classes);
            this._class_map.set(key_class, exp_classes_);
        }
        else if(key_class instanceof Object)
        {
            let keys = Object.keys(key_class);
            for(let i = 0; i < keys.length; i++)
            {
                let key = keys[i];
                let classes_ = key_class[key].split(' ');
                let exp_classes_ = jxp._expand_refs(classes_);
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

jxp.observe();

jxp.set({
    'theme-dark': 'bg-dark text-light',
    'theme-light': 'bg-light text-dark',
    'theme-slate': 'bg-slate text-light',
    'theme': '@theme-light',
    'panel': 'my-2 p-4 border shadow-sm rounded rounded-md',
});

<div class="jxp(panel,theme)">
    hello world!
</div>

 */
