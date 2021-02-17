import { FieldError } from "../generated/graphql";

export const toErrormap = (errors: FieldError[]) => {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
        errorMap[error.field] = error.message;
    });
    return errorMap;
};
