import { PIN_MAXLENGTHS } from "./conf";

interface IInputOptions {id: string, required: boolean, labelText?: string, icon?: string, labelSrOnly?: boolean}

class Input implements IInputOptions {
    readonly type: string;
    id: string;
    required: boolean
    labelText: string;
    labelSrOnly: boolean;
    icon?: string;

    constructor(type: string, options: IInputOptions) {
        this.type = type;
        this.id = options.id;
        this.required = options.required;
        this.labelText = options.labelText || this.id[0].toUpperCase() + this.id.substring(1);
        this.icon = options.icon;
        this.labelSrOnly = options.labelSrOnly || false;
    }

    get name() {
        return this.id;
    }
}

export class TextInput extends Input {
    maxlength: number;
    placeholder?: string;
    value?: string;

    constructor(options: IInputOptions & { placeholder?: string, maxLength: number, value?: string }) {
        super("text", options);
        this.maxlength = options.maxLength;
        this.placeholder = options.placeholder;
        this.value = options.value;
    }
    func() {
    }
}

export class DatetimeInput extends Input {
    value?: string;

    constructor(options: IInputOptions & {value?: Date}) {
        super("datetime-local", options);
        
        let date;
        if (options.value) {
            date = options.value; 
        } else {
            // https://stackoverflow.com/a/28149561
            const timezoneOffset = (new Date()).getTimezoneOffset() * 60000;
            date = (new Date(Date.now() - timezoneOffset));
        }
        
        date.setDate(date.getDate() + 1)
        this.value = date.toISOString().slice(0, -1);
    }
}


export const indexForm = {
    title: new TextInput({
        id: "title",
        labelText: "Title:",
        placeholder: "The name of the event",
        required: true,
        maxLength: PIN_MAXLENGTHS.title,
        icon: undefined
    }),
    description: new TextInput({
        id: "description",
        labelText: "Description:",
        placeholder: "Description...",
        required: false,
        maxLength: PIN_MAXLENGTHS.description,
        icon: "egg"
    }),
    location: new TextInput({
        id: "location",
        labelText: "Location:",
        placeholder: "Where your event takes place...",
        required: true,
        maxLength: PIN_MAXLENGTHS.location,
        icon: "suitcase"
    }),
    datetime: new DatetimeInput({
        id: "datetime",
        labelText: "Time/day:",
        required: true,
        icon: "time"
    }),
    postedBy: new TextInput({
        id: "postedBy",
        labelText: "Posted by:",
        placeholder: "Your name",
        required: true,
        maxLength: PIN_MAXLENGTHS.postedBy,
        icon: "celeste"
    })
    // fileinput 
}