declare module '@ckeditor/ckeditor5-build-classic' {
  const ClassicEditor: {
    create: (element: HTMLElement | string, config?: object) => Promise<any>;
  };
  export = ClassicEditor;
}