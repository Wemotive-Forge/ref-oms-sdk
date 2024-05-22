const {required} = require("nconf");
const moment = require('moment');

exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

exports.getDateRange = async (rangeType) => {
    let startDate;
    let endDate = moment().endOf('day').toDate(); // Default end date to today

    switch (rangeType) {
        case 'thisWeek':
            startDate = moment().startOf('week').toDate();
            endDate = moment().endOf('week').toDate();
            break;
        case 'thisMonth':
            startDate = moment().startOf('month').toDate();
            endDate = moment().endOf('month').toDate();
            break;
        case 'thisYear':
            startDate = moment().startOf('year').toDate();
            endDate = moment().endOf('year').toDate();
            break;
        case 'lastWeek':
            startDate = moment().subtract(1, 'weeks').startOf('week').toDate();
            endDate = moment().subtract(1, 'weeks').endOf('week').toDate();
            break;
        case 'lastMonth':
            startDate = moment().subtract(1, 'months').startOf('month').toDate();
            endDate = moment().subtract(1, 'months').endOf('month').toDate();
            break;
        default:
            throw new Error('Invalid date range type');
    }

    return { startDate, endDate };
};


/**
 * Function to sort object keys by their values
 * @param  obj
 */
exports.sortObjectPropertiesByValues = (obj) => {
    let arr = [];
    let prop;
    let sortedObj = {};

    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({'key': prop, 'value': obj[prop]});
        }
    }

    arr.sort((a, b) => {
        return a.value - b.value;
    });

    arr.forEach((ele) => {
        sortedObj[ele.key] = ele.value;
    });

    return sortedObj; // returns sorted object
}

/**
 * Function to sort object properties by their alphabetical order
 * @param  obj
 * @param {*} order
 */
exports.sortObjectPropertiesByAlphabetialOrder = (obj, order = 'asc') => {
    let key;
    let tempArry = [];
    let i;
    let sortedObj = {};

    for (key in obj) {
        tempArry.push(key);
    }

    tempArry.sort((a, b) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }
    );

    if (order === 'desc') {
        for (i = tempArry.length - 1; i >= 0; i--) {
            sortedObj[tempArry[i]] = obj[tempArry[i]];
        }
    } else {
        for (i = 0; i < tempArry.length; i++) {
            sortedObj[tempArry[i]] = obj[tempArry[i]];
        }
    }
    return sortedObj;
}

/**
 * Function to upload file
 * @param  obj
 */
exports.uploadFileUtility = (obj) => {
    if (obj.file) {
        let file = obj.file
        let fileName = file.name

        file.mv(__dirname + '/upload/' + fileName, (err) => {
            if (err) {
                return err
            } else {
                return obj
            }
        })
    }
}

export function pad(str, count=2, char='0') {
    str = str.toString();
    if (str.length < count)
        str = Array(count - str.length).fill(char).join('') + str;
    return str;
}