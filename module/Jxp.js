
/**
 * Jxp module v1.5.17
 * 
 * replaces registered classes actively using mutation observers. 
 * 
 * Jxp.get_map()
 * Jxp.entries()
 * Jxp.keys()
 * Jxp.values()
 * Jxp.token()
 * Jxp.observer()
 * Jxp.observing()
 * Jxp.update(even_if_observing)
 * Jxp.update_on_load()
 * Jxp.observe()
 * Jxp.stop()
 * Jxp.remove(key_class, class_)
 * Jxp.replace(key_class, old_class, new_class)
 * Jxp.set(key_class, classes)
 * Jxp.get(key_class)
 * Jxp.is_set(key_class, class_)
 * 
 */

export class JxpEventHandler extends Event
{
    jxp = null;

    constructor(type, options, jxp_)
    {
        super(type, options);
        this.jxp = jxp_;
    }

    handleEvent(evt)
    {
        if(this.jxp)
            this.jxp.update(evt);
    }
};

export class Jxp
{
    #class_map     = new Map();
    #space_regexp  = /\s+/g;
    #observer      = null;
    #event_handler = null;
    #token         = 'jxp:';

    constructor(token_)
    {
        if(token_)
        {
            if(typeof(token_) != 'string')
                throw TypeError('Jxp constructor parameter `token_` must be of type `string`.');
            this.#token = token_ + ':';
        }
    }

    get_map()
    {
        return this.#class_map;
    }

    entries()
    {
        return this.#class_map.entries();
    }

    keys()
    {
        return this.#class_map.keys();
    }

    values()
    {
        return this.#class_map.values();
    }

    token()
    {
        return this.token;
    }

    observer()
    {
        return this.#observer;
    }

    observing()
    {
        return !!this.#observer;
    }

    update(even_if_observing)
    {
        if(!!even_if_observing || !this.#observer)
        {
            let all_elements = document.querySelectorAll('*');
            for(let element of all_elements) 
            {
                this.#update_element(element)
            }
        }
    };

    update_on_load()
    {
        if(!this.#event_handler)
        {
            this.#event_handler = new JxpEventHandler(null, null, this);
            document.addEventListener('DOMContentLoaded', this.#event_handler);
        }
    }

    observe()
    {
        if(!this.#observer)
        {
            const config = { 
                    attributes: true,
                    attributeFilter: ['class'], 
                    childList: true, 
                    subtree: true 
            };
            const callback = function(mutation_list, observer) 
            {
                for(const mutation of mutation_list) 
                {
                    observer.jxp.#update_element_recursive(mutation.target);
                }
            };
            this.observer     = new MutationObserver(callback);
            this.observer.jxp = this;
            this.observer.observe(document, config);
        }
    };

    stop()
    {
        this.observer.disconnect();
    }

    remove(key_class, class_)
    {
        if(typeof(key_class) == 'string')
        {
            if(!class_)
            {
                return this.#class_map.delete(key_class);
            }
            else if(typeof(class_) == 'string')
            {
                if(this.#class_map.has(key_class))
                {
                    let classes_ = this.#class_map.get(key_class);
                    let new_classes_ = Array();
                    let found = false;
                    for(let class_i in classes_)
                    {
                        if(class_i == class_)
                        {
                            found = true;
                            break;
                        }
                    }
                    if(found)
                        this.#class_map.set(key_class, new_classes_);
                    return found;
                }
            }
            else 
                throw TypeError('invalid type. expecting string for argumnent class');
        }
        else 
            throw TypeError('invalid type. expecting string for argumnent key_class');
        return false;
    }

    replace(key_class, old_class, new_class)
    {
        if(typeof(key_class) == 'string' 
        && typeof(old_class) == 'string'
        && typeof(new_class) == 'string')
        {
            if(this.#class_map.has(key_class))
            {
                let classes_ = this.#class_map.get(key_class);
                let i        = classes_.indexOf(old_class);
                if(i != -1)
                {
                    classes_[i] = new_class;
                    return true;
                }
            }
        }
        else 
            throw TypeError('invalid type. expecting string for argumnent key_class');
        return false;
    }

    set(key_class, classes)
    {
        if(typeof(key_class) == 'string')
        {
            if(typeof(classes) == 'string')
            {
                classes = classes.replaceAll(this.#space_regexp, ' ');
                classes = classes.trim();
                if(classes.length > 0)
                {
                    let classes_ = classes.split(' ');
                    let exp_classes_ = this.#expand_refs(classes_);
                    this.#class_map.set(key_class, exp_classes_);
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
                                throw SyntaxError('unexpected space in class array element');
                        }
                    }
                    else 
                        throw TypeError('invalid type. expecting array of strings or string');
                }
                let exp_classes_ = this.#expand_refs(classes);
                this.#class_map.set(key_class, exp_classes_);
            }
            else 
                throw TypeError('invalid type. expecting array of strings or string for parameter classes');
        }
        else if(key_class instanceof Object)
        {
            let entries = Object.entries(key_class);
            for(let [key, value] of entries)
            {
                let classes_ = value;
                if(typeof(classes_) == 'string')
                {
                    classes_ = classes_.replaceAll(this.#space_regexp, ' ');
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
                                throw SyntaxError('unexpected space in class array element');
                        }
                        else 
                            throw TypeError('invalid type. expecting array of strings or string');
                    }
                }
                else 
                    throw TypeError('invalid type. expecting array of strings or string');
                let exp_classes_ = this.#expand_refs(classes_);
                this.#class_map.set(key, exp_classes_);
            }
        }
        else 
            throw TypeError('invalid type. expecting string or object for argumnent key_class');
    }

    get(key_class)
    {
        return this.#class_map.get(key_class);
    }

    is_set(key_class, class_)
    {
        if(!class_)
            return this.#class_map.has(key_class);
        else
        {
            if(!this.#class_map.has(key_class))
                return false;
            const classes_ = this.#class_map.get(key_class);
            return classes_.indexOf(class_) != -1;
        }
    }

    #expand_refs(classes)
    {
        let expanded_classes_ = new Array();
        for(let class_ of classes)
        {
            if(class_.charAt(0) == '@')
            {
                let ref_key     = class_.substring(1, class_.length);
                let ref_classes = this.get(ref_key);
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

    #update_element(element)
    {
        if(element)
        {
            for(let class_i of element.classList)
            {
                if(class_i.length > 0)
                {
                    const keyword = this.#token;
                    if(class_i.startsWith(this.#token))
                    {
                        let jxp_params  = class_i.substring(keyword.length, class_i.length);
                        let jxp_classes = jxp_params.split(',');
                        for(let jxp_class of jxp_classes)
                        {
                            if(this.is_set(jxp_class))
                            {
                                let classes_     = this.get(jxp_class);
                                let exp_classes  = this.#expand_refs(classes_);
                                for(let exp_class of exp_classes)
                                    element.classList.add(exp_class);
                            }
                        }
                        element.classList.remove(class_i);
                    }
                }
            }
        }
    }

    #update_element_recursive(element)
    {
        if(element)
        {
            this.#update_element(element);
            for(let child of element.children)
            {
                this.#update_element_recursive(child);
            }
        }
    }

};

export default Jxp;
