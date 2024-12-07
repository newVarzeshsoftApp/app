/**
 * Checks if the given object is not empty, undefined, or null.
 *
 * @param obj - The object to check.
 * @returns {boolean} - True if the object is not empty, undefined, or null; false otherwise.
 */
export const isNotEmpty = (obj: unknown): boolean => {
  return obj !== undefined && obj !== null && obj !== '';
};

/**
 * Converts a query object into a query string for URL usage.
 * Skips keys with empty values and adds commas to the `order` key.
 *
 * @param queryObject - An object representing query parameters.
 * @returns {string} - A query string starting with "?" or an empty string if no valid parameters exist.
 */
export const prepareQuery = (queryObject: object): string => {
  let query = '?';
  Object.entries(queryObject).forEach((item, index) => {
    const itemValue = item[1];
    const itemKey = item[0];
    if (isNotEmpty(itemValue) && itemValue !== null && itemValue !== '') {
      if (index !== 0) {
        if (item[0] !== 'order') {
          query += `&${itemKey}=${itemValue}`;
        } else {
          query += `,${itemValue}`;
        }
      } else {
        query += `${itemKey}=${itemValue}`;
      }
    }
  });
  return query === '?' ? '' : query;
};

/**
 * Formats a number into a readable string with abbreviations (e.g., K, M, B, T).
 *
 * @param number - The number to format.
 * @returns {string} - Formatted number as a string with appropriate suffixes.
 */
// export const formatNumber = (number: number): string => {
//   const absNumber = Math.abs(number);
//   let abbreviatedNumber: string | number = absNumber;

//   if (absNumber >= 1e3 && absNumber < 1e6) {
//     abbreviatedNumber = absNumber / 1e3;
//     abbreviatedNumber = Number.isInteger(abbreviatedNumber)
//       ? `${abbreviatedNumber}K`
//       : `${abbreviatedNumber.toFixed(2)}K`;
//   } else if (absNumber >= 1e6 && absNumber < 1e9) {
//     abbreviatedNumber = absNumber / 1e6;
//     abbreviatedNumber = Number.isInteger(abbreviatedNumber)
//       ? `${abbreviatedNumber}M`
//       : `${abbreviatedNumber.toFixed(2)}M`;
//   } else if (absNumber >= 1e9 && absNumber < 1e12) {
//     abbreviatedNumber = absNumber / 1e9;
//     abbreviatedNumber = Number.isInteger(abbreviatedNumber)
//       ? `${abbreviatedNumber}B`
//       : `${abbreviatedNumber.toFixed(2)}B`;
//   } else if (absNumber >= 1e12) {
//     abbreviatedNumber = absNumber / 1e12;
//     abbreviatedNumber = Number.isInteger(abbreviatedNumber)
//       ? `${abbreviatedNumber}T`
//       : `${abbreviatedNumber.toFixed(2)}T`;
//   }

//   return (number < 0 ? '-' : '') + abbreviatedNumber;
// };

/**
 * Preloads images by creating new Image objects for each source in the array.
 *
 * @param srcArray - Array of image URLs to preload.
 */
export const preloadImages = (srcArray: string[]): void => {
  srcArray.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

/**
 * Converts a query string into a JSON object.
 * If the key is "date", the value will be split into an array.
 *
 * @param query - A query string (e.g., "?key=value&date=2022-01-01").
 * @returns {object} - A JSON object representing the query parameters.
 */
export function queryToJSON(query: string): object {
  const params = new URLSearchParams(query);
  const queryObject: {[key: string]: string | string[]} = {};
  params.forEach((value, key) => {
    if (key === 'date') {
      queryObject[key] = value.split(',');
    } else {
      queryObject[key] = value;
    }
  });

  return queryObject;
}

export const formatNumber = (num: any) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export function calculateRemainingDays(subscription: {
  start: string;
  end: string;
}): number {
  const startDate = new Date(subscription.start);
  const endDate = new Date(subscription.end);
  // Calculate the difference in milliseconds between start and end
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

  // Convert milliseconds to days
  const totalDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  // Calculate how many days have passed since the start date
  const currentDate = new Date();
  const elapsedMilliseconds = currentDate.getTime() - startDate.getTime();
  const elapsedDays = Math.ceil(elapsedMilliseconds / (1000 * 60 * 60 * 24));

  // Calculate remaining days
  const remainingDays = totalDays - elapsedDays;

  return remainingDays >= 0 ? remainingDays : 0; // Ensure no negative days
}
export function convertToPersianTimeLabel(value: number): string {
  if (value < 0 || value > 1800) {
    throw new Error('Value must be between 0 and 1800 (up to 5 years).');
  }

  const years = Math.floor(value / 360); // Each year is 360
  const months = Math.floor((value % 360) / 30); // Each month is 30

  let result = '';

  if (years > 0) {
    result += `${years} سال`;
  }
  if (months > 0) {
    if (result) result += ' و '; // Add 'و' if both years and months are present
    result += `${months} ماه`;
  }

  return result || '0 ماه'; // If no valid year or month, default to "0 ماه"
}

/**
 * Gets the English ordinal label for a given index.
 *
 * @param index - The zero-based index for which to get the ordinal label.
 * @returns {string} - Ordinal label (e.g., "First", "Second", ..., "Fiftieth").
 */
export const getNumberLabel = (index: number): string => {
  const labels = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
    'Eleventh',
    'Twelfth',
    'Thirteenth',
    'Fourteenth',
    'Fifteenth',
    'Sixteenth',
    'Seventeenth',
    'Eighteenth',
    'Nineteenth',
    'Twentieth',
    'Twenty-First',
    'Twenty-Second',
    'Twenty-Third',
    'Twenty-Fourth',
    'Twenty-Fifth',
    'Twenty-Sixth',
    'Twenty-Seventh',
    'Twenty-Eighth',
    'Twenty-Ninth',
    'Thirtieth',
    'Thirty-First',
    'Thirty-Second',
    'Thirty-Third',
    'Thirty-Fourth',
    'Thirty-Fifth',
    'Thirty-Sixth',
    'Thirty-Seventh',
    'Thirty-Eighth',
    'Thirty-Ninth',
    'Fortieth',
    'Forty-First',
    'Forty-Second',
    'Forty-Third',
    'Forty-Fourth',
    'Forty-Fifth',
    'Forty-Sixth',
    'Forty-Seventh',
    'Forty-Eighth',
    'Forty-Ninth',
    'Fiftieth',
  ];
  return labels[index] || `${index + 1}th`;
};
