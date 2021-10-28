import currency from "./currency";

// Round 2 decimal places only if necessary
function round(value = 0) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Allow only numbers and one decimal point
function validateAmount(string) {
    const pattern = /^(\d+)?([.]?\d{0,2})?$/;
    return pattern.test(string);
}

function isValidParameter(arrayListToSearchFrom = [], elementToSearch = "") {
    let isValidParam = false;
    arrayListToSearchFrom.forEach(allowedType => {
        if (allowedType === elementToSearch) {
            isValidParam = true;
            return;
        }
    });

    return isValidParam;
}

function upperCaseFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function convertPropertyNumberToString(values = [], property = "id") {
    return values.map(value => {
        value[property] = value[property].toString();
        return value;
    });
}

function includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects(
    arrayOfObjects = [],
    objectToBeIncluded = {},
    setObjectToBeIncludedInArrayOfObjects = () => {}
) {
    if (arrayOfObjects && objectToBeIncluded) {
        let isExists = false;
        if (
            arrayOfObjects.some(
                arrayOfObject => arrayOfObject.id === objectToBeIncluded.id
            )
        ) {
            isExists = true;
        }
        if (!isExists) {
            setObjectToBeIncludedInArrayOfObjects([
                ...arrayOfObjects,
                objectToBeIncluded
            ]);
        }
    }
}

function getCurrency() {
    const list = [];

    for (let prop in currency) {
        if (!currency.hasOwnProperty(prop)) {
            //The current property is not a direct property of p
            continue;
        }
        const symbol = currency[prop].symbol;
        list.push({ label: symbol, value: symbol });
    }

    return list;
}

export default {
    round,
    validateAmount,
    isValidParameter,
    upperCaseFirstLetter,
    convertPropertyNumberToString,
    includeObjectIfObjectPropertyIdNotExistsInArrayOfObjects,
    getCurrency
};
