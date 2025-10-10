// Export images
export * from "./images";
export { default as Images } from "./images";

// Export icons
export * from "./icons";
export { default as Icons } from "./icons";

// Main constants object
import Images from "./images";
import Icons from "./icons";

export const Constants = {
    Images,
    Icons,
};

export default Constants;
