// Allow TypeScript to import image, asset, and CSS files
// (handled at runtime by webpack's file-loader / css-loader)

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow TypeScript to import image and static asset files
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}
