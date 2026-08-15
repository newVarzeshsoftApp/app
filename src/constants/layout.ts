import {Dimensions} from 'react-native';

/** Matches App.tsx / Header web shell: max-w-[450px] */
export const APP_CONTENT_MAX_WIDTH = 450;

export function getAppContentWidth(): number {
  return Math.min(Dimensions.get('window').width, APP_CONTENT_MAX_WIDTH);
}

/** Product detail hero height for a 4:3 frame within the app content width. */
export function getProductDetailImageHeight(): number {
  return getAppContentWidth() * (3 / 4);
}
