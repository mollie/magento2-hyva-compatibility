/*
 *  Copyright Magmodules.eu. All rights reserved.
 *  See COPYING.txt for license details.
 */

window.mollieObjectToFormData = (object, prefix = null, formDataObject = null) => {
    const formData = formDataObject || new FormData();
    Object.keys(object).forEach(key => {
        const value = object[key];
        const name = prefix ? `${prefix}[${key}]` : key;
        if (value instanceof Object) {
            window.mollieObjectToFormData(value, name, formData);
        } else {
            formData.append(name, value);
        }
    });

    return new URLSearchParams(formData).toString();
}
