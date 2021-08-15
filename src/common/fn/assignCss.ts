export default function assignCss(el: HTMLElement, css: Partial<CSSStyleDeclaration>) {
    Object.assign(el.style, css);
}