/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils"
import {
    FieldValues,
    Path,
    RegisterOptions,
    UseFormReturn,
} from "react-hook-form"
 
import { ClassNameValue } from "tailwind-merge"
import { Input } from "../ui/input"
import FieldError from "./form-error"
import FieldLabel from "./form-label"

interface IProps<IForm extends FieldValues> {
    methods: UseFormReturn<IForm>
    name: Path<IForm>
    label?: string
    labelIcon?: React.ReactNode
    required?: boolean
    registerOptions?: RegisterOptions<IForm>
    wrapperClassName?: ClassNameValue
    hideError?: boolean
    prefixIcon?: React.ReactNode
    uppercase?: boolean
    suffix?: string
    itemClassName?: ClassNameValue
}

export function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

export function FormInput<IForm extends FieldValues>({
    methods,
    name,
    label,
    labelIcon,
    required = false,
    registerOptions,
    wrapperClassName,
    className,
    type = "text",
    hideError = false,
    uppercase = false,
    suffix = undefined,
    ...props
}: IProps<IForm> & React.InputHTMLAttributes<HTMLInputElement>) {
    const {
        register,
        formState: { errors },
    } = methods

    const error = getNestedValue(errors, name)

    const reg = register(name, {
        required: required ? `${label || "This field"} is required` : false,
        ...(uppercase && {
            setValueAs: (value: string) => value?.toUpperCase(),
        }),
        ...registerOptions,
    })

    return (
        <fieldset
            className={cn(
                "flex flex-col w-full justify-between",
                wrapperClassName,
            )}
        >
            {label && (
                <FieldLabel
                    htmlFor={name}
                    required={required}
                    isError={error}
                    className="text-xs"
                    icon={labelIcon}
                >
                    {label}
                </FieldLabel>
            )}
            <Input
                type={type}
                placeholder={props.placeholder || label}
                {...reg}
                {...props}
                id={name}
                fullWidth
                suffix={suffix}
                className={cn(
                    error ?
                        "border-red-600 focus:border-border ring-red-600!"
                    :   "",
                    uppercase && "uppercase placeholder:capitalize",
                    className,
                )}
            />
            {!hideError && error?.message && (
                <FieldError>{error?.message as string}</FieldError>
            )}
        </fieldset>
    )
}

export default FormInput