import { IPinParameters, Pin } from "./Pin";
import { MAX_UPLOAD_MB as MAX_UPLOAD_MB, PIN_MAXLENGTHS } from "./conf";
import * as express from "express";

interface IInputOptions {name: string, required: boolean, labelText?: string, icon?: string, id?:string, labelSrOnly?: boolean}

class Input implements IInputOptions {
    readonly type: string;
    name: string;
    id: string;
    required: boolean
    labelText: string;
    labelSrOnly: boolean;
    icon?: string;

    constructor(type: string, options: IInputOptions) {
        this.type = type;
        this.name = options.name;
        this.id = options.id || this.name;
        this.required = options.required;
        this.labelText = options.labelText || this.name[0].toUpperCase() + this.name.substring(1);
        this.icon = options.icon;
        this.labelSrOnly = Boolean(options.labelSrOnly);
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

export class PasswordInput extends Input {
    maxlength: number;
    placeholder?: string;
    value?: string;

    constructor(options: IInputOptions & { placeholder?: string, maxLength: number, value?: string }) {
        super("password", options);
        this.maxlength = options.maxLength;
        this.placeholder = options.placeholder;
        this.value = options.value;
    }
}

export class DatetimeInput extends Input {
    value?: string;

    constructor(options: IInputOptions & { value?: string }) {
        super("datetime-local", options);
        this.value = options.value;
    }
}

export class FileInput extends Input {
    constructor(options: IInputOptions) {
        super("file", options)
    }
}


function FullFileInput(
    name: string,
    labelTextFile: string, 

    labelTextUrl: string, 
    placeholderUrl: string,

    labelTextImageDescr: string,
    placeholderImageDescr: string,
    values?: {
        url?: string,
        imageDescription?: string
    }) {
    return {
        inputField: true,
        file: new FileInput({
            name: name + "File",
            required: false,
            labelText: labelTextFile,
            labelSrOnly: true
        }),
        url: new TextInput({
            name: name + "Url", 
            required: false, 
            labelText: labelTextUrl,
            maxLength: PIN_MAXLENGTHS.thumbnailUrl,
            placeholder: placeholderUrl,
            labelSrOnly: true,
            value: values ? values.url : undefined
        }),
        imageDescription: new TextInput({
            name: name + "ImageDescr",
            required: false,
            labelText: labelTextImageDescr,
            placeholder: placeholderImageDescr,
            maxLength: 300,
            value: values ? values.imageDescription : undefined
        })
    }
}

function pinForm(
    idSuffix="",
    values: {[name: string]: string}={},
) {
    return {
        title: new TextInput({
            name: "title",
            id: "title" + idSuffix,
            labelText: "Title:",
            placeholder: "The name of the event",
            required: true,
            maxLength: PIN_MAXLENGTHS.title,
            icon: undefined,
            value: values.title
        }),
        description: new TextInput({
            name: "description",
            id: "description" + idSuffix,
            labelText: "Description:",
            placeholder: "Description...",
            required: false,
            maxLength: PIN_MAXLENGTHS.description,
            icon: "egg",
            value: values.description
        }),
        location: new TextInput({
            name: "location",
            id: "location" + idSuffix,
            labelText: "Location:",
            placeholder: "Where your event takes place...",
            required: true,
            maxLength: PIN_MAXLENGTHS.location,
            icon: "suitcase",
            value: values.location
        }),
        datetime: new DatetimeInput({
            name: "datetime",
            id: "datetime" + idSuffix,
            labelText: "Time/day:",
            required: true,
            icon: "time",
            value: values.datetime
        }),
        postedBy: new TextInput({
            name: "postedBy",
            id: "postedBy" + idSuffix,
            labelText: "Posted by:",
            placeholder: "Your name",
            required: true,
            maxLength: PIN_MAXLENGTHS.postedBy,
            icon: "celeste",
            value: values.postedBy
        }),
        thumbnail: FullFileInput(
            "thumbnail", 
            "Thumbnail (file):", 
            "Thumbnail (upload):", "https://example.com/image.png",
            "Thumbnail alt text:", "A black-red flyer for a Newgrounds Death Rugby concert. It reads 24/11, 19:30",
            {
                imageDescription: values.thumbnailImageDescr,
                url: values.thumbnailUrl
            }
        ),
    }
}

export const loginForm = {
    login: new PasswordInput({
        name: "password",
        required: true,
        maxLength: 300,
        placeholder: "Password",
        labelText: "Enter password:"
    })
};


export function indexForm(req: express.Request) {
    return pinForm(undefined, req.query as IPinParameters);
}


export function editForms(pins: {[slug: string]: Pin}) {
    const pinSlugs = Object.keys(pins);
    const pinForms = [];
    for (let i=0; i < pinSlugs.length; i++) {
        const pinSlug = pinSlugs[i];
        const pin = pins[pinSlug];
        pinForms.push(pinForm(pinSlug, {
            title: pin.title,
            description: pin.description,
            location: pin.location,
            postedBy: pin.postedBy,
            datetime: pin.localdatetimeValue
            //thumbnail: pin.thumbnail,
            }
        ));
    }
    

    
    return pinForms
}
