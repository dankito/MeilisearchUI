export class Constants {

    static readonly isDev = import.meta.env.DEV

    static readonly userLanguage = navigator.language

    static readonly isSmallScreen = window.matchMedia("(max-width: 640px)").matches // 640px == Tailwind sm breakpoint

}
