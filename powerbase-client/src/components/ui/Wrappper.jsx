export const Wrapper = ({ children, condition, wrapper }) => (condition ? wrapper(children) : children);
