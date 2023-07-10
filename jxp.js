
/**
 * jxp v1.1.8
 * 
 * replacs registered classes actively using mutation observers. 
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
    static _class_map    = new Map();
    static _space_regexp = /\s+/g;
    static _observer     = null;

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
        if(typeof(key_class) == 'string')
        {
            if(typeof(classes) == 'string')
            {
                classes = classes.replaceAll(jxp._space_regexp, ' ');
                classes = classes.trim();
                if(classes.length > 0)
                {
                    let classes_ = classes.split(' ');
                    let exp_classes_ = jxp._expand_refs(classes_);
                    jxp._class_map.set(key_class, exp_classes_);
                }
            }
            else if(classes instanceof Array)
            {
                for(let class_ of classes)
                {
                    if(typeof(class_) == 'string')
                    {
                        if(class_.length > 0)
                        {
                            class_ = class_.trim();
                            if(class_.indexOf(' ') != -1)
                                throw 'unexpected space in class array element';
                        }
                    }
                    else 
                        throw 'invalid type. expecting array of strings or string';
                }
                let exp_classes_ = jxp._expand_refs(classes);
                jxp._class_map.set(key_class, exp_classes_);
            }
            else 
                throw 'invalid type. expecting array of strings or string for parameter classes';
        }
        else if(key_class instanceof Object)
        {
            let entries = Object.entries(key_class);
            for(let [key, value] of entries)
            {
                let classes_ = value;
                if(typeof(classes_) == 'string')
                {
                    classes_ = classes_.replaceAll(jxp._space_regexp, ' ');
                    classes_ = classes_.trim();
                    if(classes_.length > 0)
                        classes_ = classes_.split(' ');
                }
                else if(classes_ instanceof Array)
                {
                    for(let class_ of classes_)
                    {
                        if(typeof(class_) == 'string')
                        {
                            class_ = class_.trim();
                            if(class_.indexOf(' ') != -1)
                                throw 'unexpected space in class array element';
                        }
                        else 
                            throw 'invalid type. expecting array of strings or string';
                    }
                }
                else 
                    throw 'invalid type. expecting array of strings or string';
                let exp_classes_ = jxp._expand_refs(classes_);
                jxp._class_map.set(key, exp_classes_);
            }
        }
        else 
            throw 'invalid type. expecting string or object for argumnent key_class';
    }

    static get(key_class)
    {
        return jxp._class_map.get(key_class);
    }

    static is_set(key_class)
    {
        return jxp._class_map.has(key_class);
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
