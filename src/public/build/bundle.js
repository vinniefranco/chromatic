
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const NUM_NOTES_IN_SCALE = 7;
    const NUM_NOTES_IN_OCTAVE = 12;

    const modeMap = {
    	"major/ionian": 0,
    	"dorian": 1,
    	"phrygian": 2,
    	"lydian": 3,
    	"mixolydian": 4,
    	"minor/aeolian": 5,
    	"locrian": 6
    };

    const AVAILABLE_NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ];
    const AVAILABLE_MODES = [
    		"major/ionian",
    		"minor/aeolian",
    		"dorian",
    		"phrygian",
    		"lydian",
    		"mixolydian",
    		"locrian"
    ];
    const SCALE_FORMULA = [2, 2, 1, 2, 2, 2, 1];

    const noteIndex = (i) => AVAILABLE_NOTES.indexOf(i);
    const noteName = (i) => AVAILABLE_NOTES[i];

    const nMap = (n, cb) => {
    	return [...Array(n).keys()].map((idx) => cb(idx + 1));
    };

    const nTimes = (n, cb) => nMap(n, idx => cb(idx - 1));

    const getModeNoteMap =(key, mode) => {
    	const noteOffset = noteIndex(key);
    	const modeOffset = modeMap[mode];

    	const scaleFormula =
    		nTimes(NUM_NOTES_IN_SCALE, (idx) => SCALE_FORMULA[(idx + modeOffset) % NUM_NOTES_IN_SCALE])
    		.slice(0, 6);

    	const noteMap = [noteOffset];

    	let curNote = noteOffset;

    	for (let i=0; i < 6; i++) {
    		curNote = (curNote + scaleFormula[i]) % NUM_NOTES_IN_OCTAVE;
    		noteMap.push(curNote);
    	}

    	return noteMap;
    };

    const getNoteMap = (scale) => {
    	if (scale === "fret") {
    		return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    	} else {
    		const [key, mode] = scale;
    		return getModeNoteMap(key, mode);
    	}
    };

    const processForm = (target, oldPayload, cb) => {
    	const formData = new FormData(target);
    	const newPayload = [];

    	for (const field of formData) {
    		const [_key, value] = field;
    		newPayload.push(value);
    	}

    	if (JSON.stringify(newPayload) !== JSON.stringify(oldPayload)) {
    		cb(newPayload);
    	}
    };

    const FRET_COUNT = 19;
    const OCTAVE = 12;

    const buildString = (rootNote, noteMap) => {
    	const string = new Map();

    	nTimes(OCTAVE, (idx) => {
    		const noteNum = (noteIndex(rootNote) + idx) % OCTAVE;

    		if (!noteMap.includes(noteNum)) {
    			return ;
    		}

    		string.set(idx, noteNum);
    		// Only set note if it's visible
    		if (idx + OCTAVE < FRET_COUNT) {
    			string.set(idx + OCTAVE, noteNum);
    		}
    	});

    	return string;
    };

    function compute(tuning, scale) {
    	const noteMap = getNoteMap(scale);

    	return {
    		scale,
    		tuning,
    		noteMap: noteMap.map((nNum) => noteName(nNum)),
    		strings: tuning.map(rootNote => buildString(rootNote, noteMap))
    	}
    }

    /* src/Fretboard.svelte generated by Svelte v3.46.3 */
    const file$1 = "src/Fretboard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_3$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    // (66:3) {#each fretPlacements as fretPlacement}
    function create_each_block_3$1(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", /*fretPlacement*/ ctx[23]);
    			attr_dev(line, "y1", "30");
    			attr_dev(line, "x2", /*fretPlacement*/ ctx[23]);
    			attr_dev(line, "y2", "180");
    			set_style(line, "stroke", "rgb(200,200,200)");
    			set_style(line, "stroke-width", "2");
    			add_location(line, file$1, 66, 4, 1476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3$1.name,
    		type: "each",
    		source: "(66:3) {#each fretPlacements as fretPlacement}",
    		ctx
    	});

    	return block;
    }

    // (69:3) {#each fretStrings as string}
    function create_each_block_2$1(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x1", "44");
    			attr_dev(line, "y1", /*string*/ ctx[20]);
    			attr_dev(line, "x2", "100%");
    			attr_dev(line, "y2", /*string*/ ctx[20]);
    			set_style(line, "stroke", "rgb(200,200,200)");
    			set_style(line, "stroke-width", "2");
    			add_location(line, file$1, 69, 4, 1635);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(69:3) {#each fretStrings as string}",
    		ctx
    	});

    	return block;
    }

    // (83:2) {#each notes as note, i}
    function create_each_block_1$1(ctx) {
    	let g;
    	let circle;
    	let circle_fill_value;
    	let circle_cx_value;
    	let circle_cy_value;
    	let text_1;
    	let t_value = /*note*/ ctx[18].label + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;
    	let g_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*i*/ ctx[17]);
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			circle = svg_element("circle");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle, "stroke", "black");
    			attr_dev(circle, "fill", circle_fill_value = /*colorForNote*/ ctx[7](/*note*/ ctx[18].label));
    			attr_dev(circle, "cx", circle_cx_value = /*note*/ ctx[18].x);
    			attr_dev(circle, "cy", circle_cy_value = /*note*/ ctx[18].y);
    			attr_dev(circle, "r", "12");
    			attr_dev(circle, "class", "svelte-17m7goc");
    			add_location(circle, file$1, 84, 3, 2334);
    			attr_dev(text_1, "x", text_1_x_value = /*note*/ ctx[18].x);
    			attr_dev(text_1, "y", text_1_y_value = /*note*/ ctx[18].y + 3);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "stroke", "none");
    			attr_dev(text_1, "font-size", "0.7em");
    			attr_dev(text_1, "class", "svelte-17m7goc");
    			add_location(text_1, file$1, 85, 3, 2426);
    			attr_dev(g, "class", g_class_value = "fretNote note_" + /*note*/ ctx[18].num + " svelte-17m7goc");
    			attr_dev(g, "id", "note_" + /*i*/ ctx[17]);
    			add_location(g, file$1, 83, 2, 2249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);
    			append_dev(g, text_1);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = listen_dev(g, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*notes*/ 2 && circle_fill_value !== (circle_fill_value = /*colorForNote*/ ctx[7](/*note*/ ctx[18].label))) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}

    			if (dirty & /*notes*/ 2 && circle_cx_value !== (circle_cx_value = /*note*/ ctx[18].x)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*notes*/ 2 && circle_cy_value !== (circle_cy_value = /*note*/ ctx[18].y)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*notes*/ 2 && t_value !== (t_value = /*note*/ ctx[18].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*notes*/ 2 && text_1_x_value !== (text_1_x_value = /*note*/ ctx[18].x)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*notes*/ 2 && text_1_y_value !== (text_1_y_value = /*note*/ ctx[18].y + 3)) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*notes*/ 2 && g_class_value !== (g_class_value = "fretNote note_" + /*note*/ ctx[18].num + " svelte-17m7goc")) {
    				attr_dev(g, "class", g_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(83:2) {#each notes as note, i}",
    		ctx
    	});

    	return block;
    }

    // (90:2) {#if config.scale !== "fret"}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*currentScale*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentScale, colorForNote*/ 132) {
    				each_value = /*currentScale*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(90:2) {#if config.scale !== \\\"fret\\\"}",
    		ctx
    	});

    	return block;
    }

    // (91:3) {#each currentScale as degree, i}
    function create_each_block$1(ctx) {
    	let g;
    	let circle;
    	let circle_fill_value;
    	let text_1;
    	let t_value = /*degree*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			circle = svg_element("circle");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(circle, "stroke", "black");
    			attr_dev(circle, "fill", circle_fill_value = /*colorForNote*/ ctx[7](/*degree*/ ctx[15]));
    			attr_dev(circle, "cx", 30 * /*i*/ ctx[17] + 40);
    			attr_dev(circle, "cy", 230);
    			attr_dev(circle, "r", "10");
    			add_location(circle, file$1, 92, 5, 2636);
    			attr_dev(text_1, "x", 30 * /*i*/ ctx[17] + 40);
    			attr_dev(text_1, "y", 232);
    			attr_dev(text_1, "text-anchor", "middle");
    			attr_dev(text_1, "stroke", "none");
    			attr_dev(text_1, "font-size", "0.6em");
    			add_location(text_1, file$1, 93, 5, 2728);
    			add_location(g, file$1, 91, 4, 2627);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, circle);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentScale*/ 4 && circle_fill_value !== (circle_fill_value = /*colorForNote*/ ctx[7](/*degree*/ ctx[15]))) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}

    			if (dirty & /*currentScale*/ 4 && t_value !== (t_value = /*degree*/ ctx[15] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(91:3) {#each currentScale as degree, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let svg;
    	let g0;
    	let line;
    	let each0_anchor;
    	let g1;
    	let circle0;
    	let circle1;
    	let circle2;
    	let circle3;
    	let circle4;
    	let circle5;
    	let circle6;
    	let circle7;
    	let g2;
    	let each_value_3 = /*fretPlacements*/ ctx[6];
    	validate_each_argument(each_value_3);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*fretStrings*/ ctx[5];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*notes*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block = /*config*/ ctx[0].scale !== "fret" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			line = svg_element("line");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			each0_anchor = empty();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g1 = svg_element("g");
    			circle0 = svg_element("circle");
    			circle1 = svg_element("circle");
    			circle2 = svg_element("circle");
    			circle3 = svg_element("circle");
    			circle4 = svg_element("circle");
    			circle5 = svg_element("circle");
    			circle6 = svg_element("circle");
    			circle7 = svg_element("circle");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			g2 = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(line, "x1", "40");
    			attr_dev(line, "y1", "26");
    			attr_dev(line, "x2", "40");
    			attr_dev(line, "y2", "184");
    			set_style(line, "stroke", "rgb(55,55,0)");
    			set_style(line, "stroke-width", "8");
    			add_location(line, file$1, 64, 3, 1344);
    			attr_dev(g0, "id", "fretBoard");
    			attr_dev(g0, "width", "98%");
    			attr_dev(g0, "height", "100%");
    			add_location(g0, file$1, 63, 2, 1296);
    			attr_dev(circle0, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle0, "cx", "154");
    			attr_dev(circle0, "cy", "204");
    			attr_dev(circle0, "r", "4");
    			add_location(circle0, file$1, 73, 3, 1760);
    			attr_dev(circle1, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle1, "cx", "245");
    			attr_dev(circle1, "cy", "204");
    			attr_dev(circle1, "r", "4");
    			add_location(circle1, file$1, 74, 3, 1817);
    			attr_dev(circle2, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle2, "cx", "336");
    			attr_dev(circle2, "cy", "204");
    			attr_dev(circle2, "r", "4");
    			add_location(circle2, file$1, 75, 3, 1874);
    			attr_dev(circle3, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle3, "cx", "428");
    			attr_dev(circle3, "cy", "204");
    			attr_dev(circle3, "r", "4");
    			add_location(circle3, file$1, 76, 3, 1931);
    			attr_dev(circle4, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle4, "cx", "558");
    			attr_dev(circle4, "cy", "204");
    			attr_dev(circle4, "r", "4");
    			add_location(circle4, file$1, 77, 3, 1988);
    			attr_dev(circle5, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle5, "cx", "570");
    			attr_dev(circle5, "cy", "204");
    			attr_dev(circle5, "r", "4");
    			add_location(circle5, file$1, 78, 3, 2045);
    			attr_dev(circle6, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle6, "cx", "702");
    			attr_dev(circle6, "cy", "204");
    			attr_dev(circle6, "r", "4");
    			add_location(circle6, file$1, 79, 3, 2102);
    			attr_dev(circle7, "class", "fretmarker svelte-17m7goc");
    			attr_dev(circle7, "cx", "792");
    			attr_dev(circle7, "cy", "204");
    			attr_dev(circle7, "r", "4");
    			add_location(circle7, file$1, 80, 3, 2159);
    			add_location(g1, file$1, 72, 2, 1753);
    			add_location(g2, file$1, 88, 2, 2550);
    			attr_dev(svg, "width", /*width*/ ctx[3]);
    			attr_dev(svg, "height", /*height*/ ctx[4]);
    			add_location(svg, file$1, 62, 1, 1271);
    			attr_dev(div, "id", "fretContainer");
    			add_location(div, file$1, 61, 0, 1245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, g0);
    			append_dev(g0, line);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(g0, null);
    			}

    			append_dev(g0, each0_anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append_dev(svg, g1);
    			append_dev(g1, circle0);
    			append_dev(g1, circle1);
    			append_dev(g1, circle2);
    			append_dev(g1, circle3);
    			append_dev(g1, circle4);
    			append_dev(g1, circle5);
    			append_dev(g1, circle6);
    			append_dev(g1, circle7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append_dev(svg, g2);
    			if (if_block) if_block.m(g2, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fretPlacements*/ 64) {
    				each_value_3 = /*fretPlacements*/ ctx[6];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(g0, each0_anchor);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty & /*fretStrings*/ 32) {
    				each_value_2 = /*fretStrings*/ ctx[5];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*notes, selectNote, colorForNote*/ 130) {
    				each_value_1 = /*notes*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, g2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*config*/ ctx[0].scale !== "fret") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(g2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function selectNote(i) {
    	document.querySelector(`#note_${i}`).classList.toggle("selected");
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fretboard', slots, []);
    	let { config } = $$props;
    	let notes = [];
    	const availableNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
    	const stringPaddings = [180, 150, 120, 90, 60, 30];
    	let currentScale;
    	const width = 860, height = 260, padding = 180 / 6;
    	const fretWidth = (width - 40) / 18;
    	const fretStrings = nMap(6, idx => padding * idx);
    	const fretPlacements = nMap(18, idx => Math.round(fretWidth * idx + 40));
    	const scaleColors = ["#BD92D2", "#CF92C3", "#D6A4CA", "#DEB4D3", "#EBCEE2", "#F4F8F5", "#D4E2D7"];

    	function colorForNote(note) {
    		if (config.scale !== "fret") {
    			return scaleColors[config.noteMap.indexOf(note)];
    		}

    		return "white";
    	}

    	function update(config) {
    		let tempNotes = [];

    		config.strings.map((stringNotes, yIdx) => {
    			for (const [key, value] of config.strings[yIdx]) {
    				tempNotes.push({
    					label: availableNotes[value],
    					num: value,
    					x: fretWidth * (key + 1) - 28,
    					y: stringPaddings[yIdx]
    				});
    			}
    		});

    		$$invalidate(2, currentScale = config.noteMap);
    		$$invalidate(1, notes = tempNotes);
    	}

    	const writable_props = ['config'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fretboard> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => selectNote(i);

    	$$self.$$set = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		config,
    		nMap,
    		notes,
    		availableNotes,
    		stringPaddings,
    		currentScale,
    		width,
    		height,
    		padding,
    		fretWidth,
    		fretStrings,
    		fretPlacements,
    		scaleColors,
    		colorForNote,
    		selectNote,
    		update
    	});

    	$$self.$inject_state = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    		if ('notes' in $$props) $$invalidate(1, notes = $$props.notes);
    		if ('currentScale' in $$props) $$invalidate(2, currentScale = $$props.currentScale);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*config*/ 1) {
    			config && update(config);
    		}
    	};

    	return [
    		config,
    		notes,
    		currentScale,
    		width,
    		height,
    		fretStrings,
    		fretPlacements,
    		colorForNote,
    		click_handler
    	];
    }

    class Fretboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fretboard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*config*/ ctx[0] === undefined && !('config' in props)) {
    			console.warn("<Fretboard> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		throw new Error("<Fretboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Fretboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.3 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (45:2) {#each fretModes as mode}
    function create_each_block_4(ctx) {
    	let option;
    	let t0_value = /*mode*/ ctx[17] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*mode*/ ctx[17];
    			option.value = option.__value;
    			add_location(option, file, 45, 3, 932);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(45:2) {#each fretModes as mode}",
    		ctx
    	});

    	return block;
    }

    // (51:1) {#if selectedFretMode == "scale"}
    function create_if_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*selectedMode*/ ctx[1]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(51:1) {#if selectedFretMode == \\\"scale\\\"}",
    		ctx
    	});

    	return block;
    }

    // (54:2) {:else}
    function create_else_block_1(ctx) {
    	let form;
    	let select0;
    	let t0;
    	let select1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_3 = AVAILABLE_NOTES;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = AVAILABLE_MODES;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			button = element("button");
    			button.textContent = "Set";
    			attr_dev(select0, "name", "key");
    			add_location(select0, file, 55, 4, 1192);
    			attr_dev(select1, "name", "mode");
    			add_location(select1, file, 62, 4, 1335);
    			add_location(button, file, 69, 4, 1482);
    			add_location(form, file, 54, 3, 1143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			append_dev(form, t0);
    			append_dev(form, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			append_dev(form, t1);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*changeMode*/ ctx[7]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*AVAILABLE_NOTES*/ 0) {
    				each_value_3 = AVAILABLE_NOTES;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty & /*AVAILABLE_MODES*/ 0) {
    				each_value_2 = AVAILABLE_MODES;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(54:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (52:2) {#if selectedMode}
    function create_if_block_2(ctx) {
    	let t0;
    	let a;
    	let t1_value = /*selectedMode*/ ctx[1][0] + "";
    	let t1;
    	let t2;
    	let t3_value = /*selectedMode*/ ctx[1][1] + "";
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("Rocking ");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(t3_value);
    			add_location(a, file, 52, 11, 1066);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, a, anchor);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(a, t3);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*clearMode*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedMode*/ 2 && t1_value !== (t1_value = /*selectedMode*/ ctx[1][0] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*selectedMode*/ 2 && t3_value !== (t3_value = /*selectedMode*/ ctx[1][1] + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(52:2) {#if selectedMode}",
    		ctx
    	});

    	return block;
    }

    // (57:5) {#each AVAILABLE_NOTES as key}
    function create_each_block_3(ctx) {
    	let option;
    	let t0_value = /*key*/ ctx[20] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*key*/ ctx[20];
    			option.value = option.__value;
    			add_location(option, file, 57, 6, 1254);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(57:5) {#each AVAILABLE_NOTES as key}",
    		ctx
    	});

    	return block;
    }

    // (64:5) {#each AVAILABLE_MODES as mode}
    function create_each_block_2(ctx) {
    	let option;
    	let t0_value = /*mode*/ ctx[17] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*mode*/ ctx[17];
    			option.value = option.__value;
    			add_location(option, file, 64, 6, 1399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(64:5) {#each AVAILABLE_MODES as mode}",
    		ctx
    	});

    	return block;
    }

    // (88:1) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let t1_value = /*config*/ ctx[3].tuning + "";
    	let t1;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("with tuning: ");
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Change Tuning";
    			add_location(button, file, 89, 2, 1890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*shouldModifyTuning*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config*/ 8 && t1_value !== (t1_value = /*config*/ ctx[3].tuning + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(88:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:1) {#if modifyingTuning}
    function create_if_block(ctx) {
    	let form;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*config*/ ctx[3].tuning;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button = element("button");
    			button.textContent = "Set";
    			add_location(button, file, 85, 3, 1817);
    			add_location(form, file, 75, 2, 1555);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}

    			append_dev(form, t0);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*changeTuning*/ ctx[8]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*config, AVAILABLE_NOTES*/ 8) {
    				each_value = /*config*/ ctx[3].tuning;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(75:1) {#if modifyingTuning}",
    		ctx
    	});

    	return block;
    }

    // (79:5) {#each AVAILABLE_NOTES as note}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*note*/ ctx[14] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*note*/ ctx[14];
    			option.value = option.__value;
    			add_location(option, file, 79, 6, 1724);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(79:5) {#each AVAILABLE_NOTES as note}",
    		ctx
    	});

    	return block;
    }

    // (77:3) {#each config.tuning as root, i}
    function create_each_block(ctx) {
    	let select;
    	let select_value_value;
    	let each_value_1 = AVAILABLE_NOTES;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "name", `str${/*i*/ ctx[13]}`);
    			add_location(select, file, 77, 4, 1642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*root*/ ctx[11]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*AVAILABLE_NOTES*/ 0) {
    				each_value_1 = AVAILABLE_NOTES;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*config, AVAILABLE_NOTES*/ 8 && select_value_value !== (select_value_value = /*root*/ ctx[11])) {
    				select_option(select, /*root*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(77:3) {#each config.tuning as root, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let select;
    	let t2;
    	let t3;
    	let t4;
    	let fretboard;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*fretModes*/ ctx[4];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let if_block0 = /*selectedFretMode*/ ctx[0] == "scale" && create_if_block_1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*modifyingTuning*/ ctx[2]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block1 = current_block_type(ctx);

    	fretboard = new Fretboard({
    			props: { config: /*config*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Chromatic";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if_block1.c();
    			t4 = space();
    			create_component(fretboard.$$.fragment);
    			attr_dev(h1, "class", "svelte-2xy192");
    			add_location(h1, file, 42, 1, 842);
    			if (/*selectedFretMode*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[9].call(select));
    			add_location(select, file, 43, 1, 862);
    			attr_dev(main, "class", "svelte-2xy192");
    			add_location(main, file, 41, 0, 834);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedFretMode*/ ctx[0]);
    			append_dev(main, t2);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t3);
    			if_block1.m(main, null);
    			append_dev(main, t4);
    			mount_component(fretboard, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fretModes*/ 16) {
    				each_value_4 = /*fretModes*/ ctx[4];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty & /*selectedFretMode, fretModes*/ 17) {
    				select_option(select, /*selectedFretMode*/ ctx[0]);
    			}

    			if (/*selectedFretMode*/ ctx[0] == "scale") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(main, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(main, t4);
    				}
    			}

    			const fretboard_changes = {};
    			if (dirty & /*config*/ 8) fretboard_changes.config = /*config*/ ctx[3];
    			fretboard.$set(fretboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fretboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fretboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			destroy_component(fretboard);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let fretModes = ["fret", "scale"];
    	let selectedFretMode = "fret";
    	let selectedScale;
    	let selectedMode;
    	let modifyingTuning = false;
    	let config = compute(["E", "A", "D", "G", "B", "E"], "fret");

    	function shouldModifyTuning() {
    		$$invalidate(2, modifyingTuning = true);
    	}

    	function clearMode() {
    		$$invalidate(1, selectedMode = false);
    	}

    	function changeMode(e) {
    		processForm(e.target, selectedMode, payload => {
    			$$invalidate(3, config = compute(config.tuning, payload));
    			$$invalidate(1, selectedMode = payload);
    		});
    	}

    	function changeTuning(e) {
    		processForm(e.target, config.tuning, payload => {
    			$$invalidate(3, config = compute(payload, config.scale));
    			$$invalidate(2, modifyingTuning = false);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedFretMode = select_value(this);
    		$$invalidate(0, selectedFretMode);
    		$$invalidate(4, fretModes);
    	}

    	$$self.$capture_state = () => ({
    		compute,
    		AVAILABLE_NOTES,
    		AVAILABLE_MODES,
    		processForm,
    		fretModes,
    		selectedFretMode,
    		selectedScale,
    		selectedMode,
    		modifyingTuning,
    		config,
    		shouldModifyTuning,
    		clearMode,
    		changeMode,
    		changeTuning,
    		Fretboard
    	});

    	$$self.$inject_state = $$props => {
    		if ('fretModes' in $$props) $$invalidate(4, fretModes = $$props.fretModes);
    		if ('selectedFretMode' in $$props) $$invalidate(0, selectedFretMode = $$props.selectedFretMode);
    		if ('selectedScale' in $$props) selectedScale = $$props.selectedScale;
    		if ('selectedMode' in $$props) $$invalidate(1, selectedMode = $$props.selectedMode);
    		if ('modifyingTuning' in $$props) $$invalidate(2, modifyingTuning = $$props.modifyingTuning);
    		if ('config' in $$props) $$invalidate(3, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedFretMode,
    		selectedMode,
    		modifyingTuning,
    		config,
    		fretModes,
    		shouldModifyTuning,
    		clearMode,
    		changeMode,
    		changeTuning,
    		select_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
