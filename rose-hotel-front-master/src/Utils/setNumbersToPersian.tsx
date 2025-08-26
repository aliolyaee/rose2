export const toFarsiNumber = (n:any) =>
	n.toString().replace(/\d/g, (d:number) => "۰۱۲۳۴۵۶۷۸۹"[d]);
