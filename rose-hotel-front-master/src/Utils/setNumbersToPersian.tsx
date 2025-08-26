export const toFarsiNumber = (n:any) =>
        n.toString().replace(/\d/g, (d:number) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export const toEnglishNumber = (s: string) =>
        s.replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)]);
