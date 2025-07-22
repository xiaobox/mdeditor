import { Plugin, CSSProperties, PropType, ExtractPropTypes, App } from 'vue';
import { EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
declare const configProps: {
    autofocus: {
        type: BooleanConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: undefined;
    };
    indentWithTab: {
        type: BooleanConstructor;
        default: undefined;
    };
    tabSize: NumberConstructor;
    placeholder: StringConstructor;
    style: PropType<CSSProperties>;
    autoDestroy: {
        type: BooleanConstructor;
        default: undefined;
    };
    phrases: PropType<Record<string, string>>;
    root: PropType<ShadowRoot | Document>;
    extensions: PropType<import("@codemirror/state").Extension | undefined>;
    selection: PropType<import("@codemirror/state").EditorSelection | {
        anchor: number;
        head?: number | undefined;
    } | undefined>;
};
declare const props: {
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    autofocus: {
        type: BooleanConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: undefined;
    };
    indentWithTab: {
        type: BooleanConstructor;
        default: undefined;
    };
    tabSize: NumberConstructor;
    placeholder: StringConstructor;
    style: PropType<CSSProperties>;
    autoDestroy: {
        type: BooleanConstructor;
        default: undefined;
    };
    phrases: PropType<Record<string, string>>;
    root: PropType<ShadowRoot | Document>;
    extensions: PropType<import("@codemirror/state").Extension | undefined>;
    selection: PropType<import("@codemirror/state").EditorSelection | {
        anchor: number;
        head?: number | undefined;
    } | undefined>;
};
type ConfigProps = ExtractPropTypes<typeof configProps>;
type Props = ExtractPropTypes<typeof props>;
declare const events: {
    "update:modelValue": (value: string, viewUpdate: ViewUpdate) => boolean;
    change: (value: string, viewUpdate: ViewUpdate) => boolean;
    update: (viewUpdate: ViewUpdate) => boolean;
    focus: (viewUpdate: ViewUpdate) => boolean;
    blur: (viewUpdate: ViewUpdate) => boolean;
    ready: (payload: {
        view: EditorView;
        state: EditorState;
        container: HTMLDivElement;
    }) => boolean;
};
type Events = typeof events;
declare const DEFAULT_CONFIG: Readonly<Partial<ConfigProps>>;
declare const Codemirror: import("vue").DefineComponent<{
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    autofocus: {
        type: BooleanConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: undefined;
    };
    indentWithTab: {
        type: BooleanConstructor;
        default: undefined;
    };
    tabSize: NumberConstructor;
    placeholder: StringConstructor;
    style: import("vue").PropType<import("vue").CSSProperties>;
    autoDestroy: {
        type: BooleanConstructor;
        default: undefined;
    };
    phrases: import("vue").PropType<Record<string, string>>;
    root: import("vue").PropType<ShadowRoot | Document>;
    extensions: import("vue").PropType<import("@codemirror/state").Extension | undefined>;
    selection: import("vue").PropType<import("@codemirror/state").EditorSelection | {
        anchor: number;
        head?: number | undefined;
    } | undefined>;
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
    change: (value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
    update: (viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
    focus: (viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
    blur: (viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
    ready: (payload: {
        view: import("@codemirror/view").EditorView;
        state: import("@codemirror/state").EditorState;
        container: HTMLDivElement;
    }) => boolean;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    modelValue: {
        type: StringConstructor;
        default: string;
    };
    autofocus: {
        type: BooleanConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: undefined;
    };
    indentWithTab: {
        type: BooleanConstructor;
        default: undefined;
    };
    tabSize: NumberConstructor;
    placeholder: StringConstructor;
    style: import("vue").PropType<import("vue").CSSProperties>;
    autoDestroy: {
        type: BooleanConstructor;
        default: undefined;
    };
    phrases: import("vue").PropType<Record<string, string>>;
    root: import("vue").PropType<ShadowRoot | Document>;
    extensions: import("vue").PropType<import("@codemirror/state").Extension | undefined>;
    selection: import("vue").PropType<import("@codemirror/state").EditorSelection | {
        anchor: number;
        head?: number | undefined;
    } | undefined>;
}>> & {
    onChange?: ((value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
    onUpdate?: ((viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
    onFocus?: ((viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
    onBlur?: ((viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
    onReady?: ((payload: {
        view: import("@codemirror/view").EditorView;
        state: import("@codemirror/state").EditorState;
        container: HTMLDivElement;
    }) => any) | undefined;
    "onUpdate:modelValue"?: ((value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
}, {
    autofocus: boolean;
    disabled: boolean;
    indentWithTab: boolean;
    autoDestroy: boolean;
    modelValue: string;
}>;
declare const install: Plugin;
declare const _default: {
    Codemirror: import("vue").DefineComponent<{
        modelValue: {
            type: StringConstructor;
            default: string;
        };
        autofocus: {
            type: BooleanConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: undefined;
        };
        indentWithTab: {
            type: BooleanConstructor;
            default: undefined;
        };
        tabSize: NumberConstructor;
        placeholder: StringConstructor;
        style: import("vue").PropType<import("vue").CSSProperties>;
        autoDestroy: {
            type: BooleanConstructor;
            default: undefined;
        };
        phrases: import("vue").PropType<Record<string, string>>;
        root: import("vue").PropType<ShadowRoot | Document>;
        extensions: import("vue").PropType<import("@codemirror/state").Extension | undefined>;
        selection: import("vue").PropType<import("@codemirror/state").EditorSelection | {
            anchor: number;
            head?: number | undefined;
        } | undefined>;
    }, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
        change: (value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
        update: (viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
        focus: (viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
        blur: (viewUpdate: import("@codemirror/view").ViewUpdate) => boolean;
        ready: (payload: {
            view: import("@codemirror/view").EditorView;
            state: import("@codemirror/state").EditorState;
            container: HTMLDivElement;
        }) => boolean;
    }, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
        modelValue: {
            type: StringConstructor;
            default: string;
        };
        autofocus: {
            type: BooleanConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: undefined;
        };
        indentWithTab: {
            type: BooleanConstructor;
            default: undefined;
        };
        tabSize: NumberConstructor;
        placeholder: StringConstructor;
        style: import("vue").PropType<import("vue").CSSProperties>;
        autoDestroy: {
            type: BooleanConstructor;
            default: undefined;
        };
        phrases: import("vue").PropType<Record<string, string>>;
        root: import("vue").PropType<ShadowRoot | Document>;
        extensions: import("vue").PropType<import("@codemirror/state").Extension | undefined>;
        selection: import("vue").PropType<import("@codemirror/state").EditorSelection | {
            anchor: number;
            head?: number | undefined;
        } | undefined>;
    }>> & {
        onChange?: ((value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
        onUpdate?: ((viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
        onFocus?: ((viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
        onBlur?: ((viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
        onReady?: ((payload: {
            view: import("@codemirror/view").EditorView;
            state: import("@codemirror/state").EditorState;
            container: HTMLDivElement;
        }) => any) | undefined;
        "onUpdate:modelValue"?: ((value: string, viewUpdate: import("@codemirror/view").ViewUpdate) => any) | undefined;
    }, {
        autofocus: boolean;
        disabled: boolean;
        indentWithTab: boolean;
        autoDestroy: boolean;
        modelValue: string;
    }>;
    install: ((app: import("vue").App<any>, ...options: any[]) => any) & {
        install?: ((app: import("vue").App<any>, ...options: any[]) => any) | undefined;
    };
};
export type { Props, Events };
export { _default as default, DEFAULT_CONFIG, Codemirror, install };
